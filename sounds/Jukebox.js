/**
 * Jukebox for Spaceship! game music.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.sounds.Jukebox');
dojo.require('spaceship.sounds.AudioManager');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.game.GameTopics');

dojo.declare('spaceship.sounds.Jukebox', spaceship.utils.Subscriber, {
    sound: spaceship.sounds.AudioManager,
    constructor: function() {
        // current track
        this._currentTrack = null;
        // listen for certain events which will dictate the sound track
        this.subscribe(spaceship.START_TITLE_TOPIC, 'onStartTitle');
        this.subscribe(spaceship.game.START_GAME_TOPIC, 'onStartGame');
    },
    
    onStartTitle: function() {
        if(this._currentTrack == spaceship.sounds.TITLE_MUSIC) return;
        this.sound.stop(spaceship.sounds.MUSIC_CHANNEL);
        this.sound.play(spaceship.sounds.TITLE_MUSIC,
            spaceship.sounds.MUSIC_CHANNEL);
        this._currentTrack = spaceship.sounds.TITLE_MUSIC;
    },
    
    onStartGame: function() {
        if(this._currentTrack == spaceship.sounds.GAME_MUSIC) return;
        this.sound.stop(spaceship.sounds.MUSIC_CHANNEL);
        this.sound.play(spaceship.sounds.GAME_MUSIC,
            spaceship.sounds.MUSIC_CHANNEL);        
        this._currentTrack = spaceship.sounds.GAME_MUSIC;
    }
});