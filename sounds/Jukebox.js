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
    sound: spaceship.sounds.AudioManager,
    constructor: function() {
        // current track
        this._currentTrack = null;
        // listen for certain events which will dictate the sound track
        this.subscribe(spaceship.START_MAIN_MENU_TOPIC, 'onStartTitle');
        this.subscribe(spaceship.game.START_GAME_TOPIC, 'onStartGame');
    },
    
    _randomChoice: function(arr) {
        var i = Math.floor(Math.random() * arr.length);
        return arr[i];
    },

    onStartTitle: function() {
        if(this._currentTrack == spaceship.sounds.TITLE_MUSIC) return;
        this.sound.stop(spaceship.sounds.MUSIC_CHANNEL);
        // always loop the title music
        this.sound.setPropertyNow('loop', true, spaceship.sounds.MUSIC_CHANNEL);
        this.sound.play(spaceship.sounds.TITLE_MUSIC,
            spaceship.sounds.MUSIC_CHANNEL);
        this._currentTrack = spaceship.sounds.TITLE_MUSIC;
    },
    
    onStartGame: function() {
        var track = this._randomChoice(spaceship.sounds.GAME_MUSIC);
        if(this._currentTrack == track) return;
        this.sound.stop(spaceship.sounds.MUSIC_CHANNEL);
        // never loop the game music
        this.sound.setPropertyNow('loop', false, spaceship.sounds.MUSIC_CHANNEL);
        // @todo: observe track end so we can play another
        this.sound.play(track, spaceship.sounds.MUSIC_CHANNEL);        
        this._currentTrack = track;
    }
});