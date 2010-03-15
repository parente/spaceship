/**
 * Audio manager for the Spaceship! game using JSonic.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.sounds.AudioManager');
dojo.require('info.mindtrove.JSonic');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.preferences.PreferencesTopics');
dojo.require('spaceship.preferences.PreferencesModel');

// catalog of sound files
spaceship.sounds = {
    // short sounds
    MENU_CHOOSE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '50565__broumbroum__sf3_sfx_menu_validate').uri,
    MENU_CANCEL_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '50557__broumbroum__sf3_sfx_menu_back').uri,
    MENU_SELECT_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '50561__broumbroum__sf3_sfx_menu_select').uri,
    GRID_SELECT_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '50561__broumbroum__sf3_sfx_menu_select').uri,
    EMPTY_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '18382__inferno__hvylas').uri,
    SHIP_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '9081__tigersound__disappear').uri,
    AMMO_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '17130__NoiseCollector__ak47_chamber_round').uri,
    HINT_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '6164__NoiseCollector__jillys_sonar').uri,
    SHIELD_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '58919__mattwasser__coin_up').uri,
    LEECH_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '22788__FranciscoPadilla__Slurp').uri,
    BOMB_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '51466__smcameron__flak_hit').uri,
    WARP_TILE_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '3380__patchen__Rhino_05').uri,
    TRANSITION_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '32987__HardPCM__Alarm003').uri,
    LOSE_REWARD_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '26375__DJ_Chronos__created_siren').uri,
    AVOID_HAZARD_SOUND : dojo.moduleUrl('spaceship.sounds.mp3.effects', '9088__tigersound__jetbike_flypast').uri,
    // music tracks
    TITLE_MUSIC : dojo.moduleUrl('spaceship.sounds.mp3.music', '173680_Entering_the_Stronghold').uri,
    GAME_MUSIC : [dojo.moduleUrl('spaceship.sounds.mp3.music', '180154_Trial_One').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '212992_soundtrack').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '40877_newgrounds_warson').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '139468_Paid_in_Blood').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '217374_High_Sea').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '196995_The_Pirates').uri,
                  dojo.moduleUrl('spaceship.sounds.mp3.music', '131207_Orion_sBelt_1st').uri],
    WIN_MUSIC : dojo.moduleUrl('spaceship.sounds.mp3.music', '192660_Village_Symphony_5560__dobroide__fireworks_18365__jasinski__yells').uri,
    LOSE_MUSIC : dojo.moduleUrl('spaceship.sounds.mp3.music', '196951_SadnessSorrowFinal').uri
};

// channel constants
spaceship.sounds.SPEECH_CHANNEL = 'default';
spaceship.sounds.SOUND_CHANNEL = 'sound';
spaceship.sounds.SOUND_TRANSITION_CHANNEL = 'sound2';
spaceship.sounds.MUSIC_CHANNEL = 'music';
spaceship.sounds.MINIGAME_CHANNEL = 'mini';

dojo.declare('spaceship.sounds.AudioManager', [spaceship.utils.Subscriber, info.mindtrove.JSonic], {
    // bundle of user preferences
    prefs: spaceship.preferences.PreferencesModel,
    postMixInProperties: function() {
        // create a deferred to indicate ready or not
        this._ready = new dojo.Deferred();
        try {
            this.inherited(arguments);
        } catch(e) {
            this._ready.errback();
        }
    },
    
    /** 
     * Initializes the JSonic audio service. Precaches all sound files when
     * the service is ready. Configures audio output based on the initial 
     * preferences.
     *
     * @return dojo.Deferred which notifies audio init success or error
     */
    startup: function() {
        // if an error during jsonic init, just abort now
        if(this._ready.fired == 1) return this._ready;
        // update preferences to initial values
        this.onUpdatePref();
        // @todo: pre-cache all sounds
        var snds = [];
        for(var key in spaceship.sounds) {
            if(key.search('_SOUND') != -1) {
                snds.push(spaceship.sounds[key]);
            }
        }
        // listen for preference changes
        this.subscribe(spaceship.preferences.UPDATE_PREFERENCE_TOPIC, 'onUpdatePref');
        // @todo: notify after all sounds precached
        this._ready.callback(); 
        // return deferred
        return this._ready;
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
            this.setProperty({
                name: 'volume', 
                value : this.prefs.speechVolume.value, 
                channel : spaceship.sounds.SPEECH_CHANNEL
            });
        }
        if(key == 'speechRate' || key == undefined) {
            this.setProperty({
                name: 'rate', 
                value: this.prefs.speechRate.value,
                channel: spaceship.sounds.SPEECH_CHANNEL
            });
            this.setProperty({
                name: 'rate',
                value: this.prefs.speechRate.value, 
                channel: spaceship.sounds.MINIGAME_CHANNEL
            });
        }
        if(key == 'soundVolume' || key == undefined) {
            this.setProperty({
                name: 'volume', 
                value: this.prefs.soundVolume.value, 
                channel: spaceship.sounds.SOUND_CHANNEL
            });
        }
        if(key == 'musicVolume' || key == undefined) {
            this.setProperty({
                name: 'volume', 
                value: this.prefs.musicVolume.value,
                channel: spaceship.sounds.MUSIC_CHANNEL
            });
        }
    }
});

// build a singleton audio manager
spaceship.sounds.AudioManager = new spaceship.sounds.AudioManager(
    {jsonicURI : '/jsonic/'});