/**
 * Audio manager for the Spaceship! game using Outfox.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.sounds.AudioManager');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.game.UserPreferences');

// catalog of sound files
spaceship.sounds = (function() {
    var path = 'sounds/mp3/';
    return {
        // short sounds
        MENU_CHOOSE_SOUND : path+'effects/50565__broumbroum__sf3_sfx_menu_validate.mp3',
        MENU_CANCEL_SOUND : path+'effects/50557__broumbroum__sf3_sfx_menu_back.mp3',
        MENU_SELECT_SOUND : path+'effects/50561__broumbroum__sf3_sfx_menu_select.mp3',
        GRID_SELECT_SOUND : path+'effects/50561__broumbroum__sf3_sfx_menu_select.mp3',
        EMPTY_TILE_SOUND : path+'effects/18382__inferno__hvylas.mp3',
        SHIP_TILE_SOUND : path+'effects/9081__tigersound__disappear.mp3',
        AMMO_TILE_SOUND : path+'effects/17130__NoiseCollector__ak47_chamber_round.mp3',
        HINT_TILE_SOUND : path+'effects/6164__NoiseCollector__jillys_sonar.mp3',
        SHIELD_TILE_SOUND : path+'effects/58919__mattwasser__coin_up.mp3',
        LEECH_TILE_SOUND : path+'effects/22788__FranciscoPadilla__Slurp.mp3',
        BOMB_TILE_SOUND : path+'effects/51466__smcameron__flak_hit.mp3',
        WARP_TILE_SOUND : path+'effects/3380__patchen__Rhino_05.mp3',
        MINIGAME_SERIES_SOUND : path+'effects/32987__HardPCM__Alarm003.mp3',
        // music tracks
        TITLE_MUSIC : path+'music/173680_Entering_the_Stronghold.mp3',
        GAME_MUSIC : [path+'music/180154_Trial_One.mp3',
                      path+'music/212992_soundtrack.mp3',
                      path+'music/40877_newgrounds_warson.mp3',
                      path+'music/139468_Paid_in_Blood.mp3',
                      path+'music/217374_High_Sea.mp3',
                      path+'music/196995_The_Pirates.mp3'],
        LOSE_MUSIC : path+'music/192660_Village_Symphony.mp3',
        WIN_MUSIC : path + 'music/131207_Orion_sBelt_1st.mp3'
    };
}());

// channel constants
spaceship.sounds.SPEECH_CHANNEL = 0;
spaceship.sounds.SOUND_CHANNEL = 1;
spaceship.sounds.SOUND_TRANSITION_CHANNEL = 2;
spaceship.sounds.MUSIC_CHANNEL = 3;

dojo.declare('spaceship.sounds.AudioManager', spaceship.utils.Subscriber, {
    // bundle of user preferences
    prefs: spaceship.game.UserPreferences,
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
            // update preferences
            self.onUpdatePrefs();
            // inform listeners
            ready.callback();
        });
        def.addErrback(function() {
            // inform listeners
            ready.errback();
        });
        // listen for preference changes
        this.subscribe(spaceship.game.UPDATE_PREFS, 'onUpdatePrefs');
        return ready;
    },
    
    onUpdatePrefs: function() {
        this.setPropertyNow('volume', this.prefs.speechVolume, 
            spaceship.sounds.SPEECH_CHANNEL);
        this.setPropertyNow('rate', this.prefs.speechRate, 
            spaceship.sounds.SPEECH_CHANNEL);
        this.setPropertyNow('volume', this.prefs.soundVolume, 
            spaceship.sounds.SOUND_CHANNEL);
        this.setPropertyNow('volume', this.prefs.musicVolume,
            spaceship.sounds.MUSIC_CHANNEL);
    }
});

// build a singleton audio manager
spaceship.sounds.AudioManager = new spaceship.sounds.AudioManager();