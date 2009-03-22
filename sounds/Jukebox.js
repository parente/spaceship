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

dojo.declare('spaceship.sounds.Jukebox', spaceship.utils.Subscriber, {
    audio: spaceship.sounds.AudioManager,
    constructor: function() {
        // current track
        this._currentTrack = null;
        // token for game music end callback
        this._soundToken = null;
        // listen for certain events which will dictate the sound track
        this.subscribe(spaceship.START_MAIN_MENU_TOPIC, 'onStartTitle');
        this.subscribe(spaceship.game.START_GAME_TOPIC, 'onStartGame');
    },
    
    _randomChoice: function(arr) {
        var i = Math.floor(Math.random() * arr.length);
        return arr[i];
    },

    onStartTitle: function() {
        if(this._soundToken) {
            this.audio.removeObserver(this._soundToken);
        }
        if(this._currentTrack == spaceship.sounds.TITLE_MUSIC) {
            // do nothing if already playing title music
            return;
        }
        this.audio.stop(spaceship.sounds.MUSIC_CHANNEL);
        // always loop the title music
        this.audio.setPropertyNow('loop', true, spaceship.sounds.MUSIC_CHANNEL);
        this.audio.play(spaceship.sounds.TITLE_MUSIC,
            spaceship.sounds.MUSIC_CHANNEL);
        this._currentTrack = spaceship.sounds.TITLE_MUSIC;
    },
    
    onStartGame: function() {
        // stop current music
        this.audio.stop(spaceship.sounds.MUSIC_CHANNEL);
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
        this.audio.play(track, spaceship.sounds.MUSIC_CHANNEL);        
        this._currentTrack = track;
    }
});