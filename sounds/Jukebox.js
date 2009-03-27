/**
 * Jukebox for Spaceship! game music.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.sounds.Jukebox');
dojo.require('spaceship.sounds.AudioManager');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.game.UserPreferences');

dojo.declare('spaceship.sounds.Jukebox', spaceship.utils.Subscriber, {
    // audio manager
    audio: spaceship.sounds.AudioManager,
    // user preferences
    prefs : spaceship.game.UserPreferences,
    constructor: function() {
        // current track
        this._currentTrack = null;
        // token for game music end callback
        this._soundToken = null;
        // listen for certain events which will dictate the sound track
        this.subscribe(spaceship.START_MAIN_MENU_TOPIC, 'onStartTitle');
        this.subscribe(spaceship.game.START_GAME_TOPIC, 'onStartGame');
        this.subscribe(spaceship.game.WIN_GAME_TOPIC, 'onWinGame');
        this.subscribe(spaceship.game.LOSE_GAME_TOPIC, 'onLoseGame');
    },
    
    _randomChoice: function(arr) {
        var i = Math.floor(Math.random() * arr.length);
        return arr[i];
    },
    
    _playLooping: function(track, volume) {
        if(this._soundToken) {
            this.audio.removeObserver(this._soundToken);
        }
        if(this._currentTrack == track) {
            // do nothing if already playing title music
            return;
        }        
        this.audio.stop(spaceship.sounds.MUSIC_CHANNEL);
        if(volume == undefined) {
            // default to user prefs for music volume
            volume = this.prefs.musicVolume;
        }
        this.audio.setPropertyNow('volume', volume, spaceship.sounds.MUSIC_CHANNEL); 
        this.audio.setPropertyNow('loop', true, spaceship.sounds.MUSIC_CHANNEL);
        this.audio.play(track, spaceship.sounds.MUSIC_CHANNEL);
        this._currentTrack = track;
    },

    onStartTitle: function() {
        this._playLooping(spaceship.sounds.TITLE_MUSIC);
    },
    
    onWinGame: function() {
        this._playLooping(spaceship.sounds.WIN_MUSIC, 0.8);
    },
    
    onLoseGame: function() {
        this._playLooping(spaceship.sounds.LOSE_MUSIC, 0.8);
    },

    onStartGame: function() {
        // stop current music
        this.audio.stop(spaceship.sounds.MUSIC_CHANNEL);
        // make sure volume is set properly
        this.audio.setPropertyNow('volume', this.prefs.musicVolume, 
            spaceship.sounds.MUSIC_CHANNEL); 
        // never loop game music
        this.audio.setPropertyNow('loop', false, spaceship.sounds.MUSIC_CHANNEL);
        // observe music end events or errors to pick another song
        this._soundToken = this.audio.addObserver(
            dojo.hitch(this,'onGameMusicDone'), 
            spaceship.sounds.MUSIC_CHANNEL, 
            ['finished-play', 'error']);
        // pick the first song
        this.onGameMusicDone();
    },

    onGameMusicDone: function() {
        do {
            var track = this._randomChoice(spaceship.sounds.GAME_MUSIC);
        } while(this._currentTrack == track);
        // make sure volume is set properly
        this.audio.setPropertyNow('volume', this.prefs.musicVolume, 
            spaceship.sounds.MUSIC_CHANNEL);
        this.audio.play(track, spaceship.sounds.MUSIC_CHANNEL);        
        this._currentTrack = track;
    }
});