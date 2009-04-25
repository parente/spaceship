/**
 * Audio manager for the Spaceship! game using Outfox.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.sounds.AudioManager');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.preferences.PreferencesTopics');
dojo.require('spaceship.preferences.PreferencesModel');

// catalog of sound files
spaceship.sounds = {
    // short sounds
    MENU_CHOOSE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '50565__broumbroum__sf3_sfx_menu_validate.mp3').uri,
    MENU_CANCEL_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '50557__broumbroum__sf3_sfx_menu_back.mp3').uri,
    MENU_SELECT_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '50561__broumbroum__sf3_sfx_menu_select.mp3').uri,
    GRID_SELECT_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '50561__broumbroum__sf3_sfx_menu_select.mp3').uri,
    EMPTY_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '18382__inferno__hvylas.mp3').uri,
    SHIP_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '9081__tigersound__disappear.mp3').uri,
    AMMO_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '17130__NoiseCollector__ak47_chamber_round.mp3').uri,
    HINT_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '6164__NoiseCollector__jillys_sonar.mp3').uri,
    SHIELD_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '58919__mattwasser__coin_up.mp3').uri,
    LEECH_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '22788__FranciscoPadilla__Slurp.mp3').uri,
    BOMB_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '51466__smcameron__flak_hit.mp3').uri,
    WARP_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '3380__patchen__Rhino_05.mp3').uri,
    TRANSITION_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '32987__HardPCM__Alarm003.mp3').uri,
    LOSE_REWARD_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '26375__DJ_Chronos__created_siren.mp3').uri,
    AVOID_HAZARD_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '9088__tigersound__jetbike_flypast.mp3').uri,
    // music tracks
    TITLE_MUSIC : dojo.moduleUrl('spaceship.sounds.mp3.music', '173680_Entering_the_Stronghold.mp3').uri,
    GAME_MUSIC : [dojo.moduleUrl('spaceship.sounds.mp3.music', '180154_Trial_One.mp3').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '212992_soundtrack.mp3').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '40877_newgrounds_warson.mp3').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '139468_Paid_in_Blood.mp3').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '217374_High_Sea.mp3').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '196995_The_Pirates.mp3').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '131207_Orion_sBelt_1st.mp3').uri],
    WIN_MUSIC : dojo.moduleUrl('spaceship.sounds.mp3.music', '192660_Village_Symphony_5560__dobroide__fireworks_18365__jasinski__yells.mp3').uri,
    LOSE_MUSIC : dojo.moduleUrl('spaceship.sounds.mp3.music', '196951_SadnessSorrowFinal.mp3').uri
};

// channel constants
spaceship.sounds.SPEECH_CHANNEL = 0;
spaceship.sounds.SOUND_CHANNEL = 1;
spaceship.sounds.SOUND_TRANSITION_CHANNEL = 2;
spaceship.sounds.MUSIC_CHANNEL = 3;
spaceship.sounds.MINIGAME_CHANNEL = 0;

dojo.declare('spaceship.sounds.AudioManager', spaceship.utils.Subscriber, {
    // bundle of user preferences
    prefs: spaceship.preferences.PreferencesModel,
    /** 
     * Initializes the Outfox audio service. Precaches all sound files when
     * the service is ready. Mixes the outfox audio API into this object
     * Configures audio output based on the initial preferences.
     *
     * @return dojo.Deferred which notifies audio init success or error
     */
    startup: function() {
        // create a deferred
        var ready = new dojo.Deferred();
        // start initializing outfox
        outfox.init("outfox", dojo.toJson, dojo.fromJson);
        //outfox.addObserver(function(of, msg) { console.debug(msg); }, 'audio');
        var def = outfox.startService('audio');
        var self = this;
        def.addCallback(function() {
            // take over all of the audio functions
            dojo.mixin(self, outfox.audio);
            // update preferences to initial values
            self.onUpdatePref();
            // pre-cache all sounds
            var snds = [];
            for(var key in spaceship.sounds) {
                if(key.search('_SOUND') != -1) {
                    snds.push(spaceship.sounds[key]);
                }
            }
            var def = outfox.audio.precache(snds);
            def.addCallback(function() {
                // notify all sounds precached
                ready.callback(); 
            });
        });
        def.addErrback(function() {
            // inform listeners
            ready.errback();
        });
        // listen for preference changes
        this.subscribe(spaceship.preferences.UPDATE_PREFERENCE_TOPIC, 'onUpdatePref');
        return ready;
    },
    
    /**
     * Called when the user commits new preferences.
     *
     * @param key String name of the preference that changed
     *
     * @subscribe UPDATE_PREFERENCE_TOPIC string
     */
    onUpdatePref: function(key) {
        if(key == 'speechVolume' || key == undefined) {
            this.setPropertyNow('volume', this.prefs.speechVolume.value, 
                spaceship.sounds.SPEECH_CHANNEL);
        }
        if(key == 'speechRate' || key == undefined) {
            this.setPropertyNow('rate', this.prefs.speechRate.value, 
                spaceship.sounds.SPEECH_CHANNEL);
        }
        if(key == 'soundVolume' || key == undefined) {
            this.setPropertyNow('volume', this.prefs.soundVolume.value, 
                spaceship.sounds.SOUND_CHANNEL);
        }
        if(key == 'musicVolume' || key == undefined) {
            this.setPropertyNow('volume', this.prefs.musicVolume.value,
                spaceship.sounds.MUSIC_CHANNEL);
        }
    }
});

// build a singleton audio manager
spaceship.sounds.AudioManager = new spaceship.sounds.AudioManager();