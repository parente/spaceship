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
dojo.require('spaceship.preferences.PreferencesModel');

dojo.declare('spaceship.sounds.Jukebox', spaceship.utils.Subscriber, {
    // audio manager
    audio: spaceship.sounds.AudioManager,
    // user preferences
    prefs : spaceship.preferences.PreferencesModel,
    /**
     * Object constructor. Subscribes to game topics.
     */
    constructor: function() {
        // current track
        this._currentTrack = null;
        // is current track looping or not
        this._looping = false;
        
        // observe music end events or errors to pick another song
        this._soundToken = this.audio.addObserver(
            dojo.hitch(this,'onMusicDone'), 
            spaceship.sounds.MUSIC_CHANNEL, 
            ['finished-play', 'error']);
        
        // listen for certain events which will dictate the sound track
        this.subscribe(spaceship.START_MAIN_MENU_TOPIC, 'onStartTitle');
        this.subscribe(spaceship.game.START_GAME_TOPIC, 'onStartGame');
        this.subscribe(spaceship.game.WIN_GAME_TOPIC, 'onWinGame');
        this.subscribe(spaceship.game.LOSE_GAME_TOPIC, 'onLoseGame');
    },
    
    /**
     * Picks a random element from the given array.
     *
     * @param arr Array
     * @return Random array element
     */
    _randomChoice: function(arr) {
        if(arr.length == 0) throw new Error('empty array');
        var i = Math.floor(Math.random() * arr.length);
        return arr[i];
    },
    
    /**
     * Plays a music track.
     *
     * @param track URL of the music to play
     * @param loop Loop the track indefinitely or no
     * @param volume Float volume level 0.0 to 1.0
     */
    _startTrack: function(track, loop, volume) {
        if(this._currentTrack == track) {
            // do nothing if already playing given music
            return;
        }
        // stop current music
        this.audio.stop(spaceship.sounds.MUSIC_CHANNEL);
        if(volume == undefined) {
            // default to user prefs for music volume
            volume = this.prefs.musicVolume.value;
        }
        this.audio.setPropertyNow('volume', volume, spaceship.sounds.MUSIC_CHANNEL); 
        this.audio.stream(track, spaceship.sounds.MUSIC_CHANNEL, track);
        this._currentTrack = track;
        this._looping = loop;
    },

    /**
     * Plays the title music in a loop.
     *
     * @subscribe START_MAIN_MENU_TOPIC
     */
    onStartTitle: function() {
        this._startTrack(spaceship.sounds.TITLE_MUSIC, true);
    },
    
    /**
     * Plays the win music in a loop.
     *
     * @subscribe WIN_GAME_TOPIC
     */
    onWinGame: function() {
        this._startTrack(spaceship.sounds.WIN_MUSIC, true, 0.8);
    },
    
    /**
     * Plays the lose music in a loop.
     *
     * @subscribe LOSE_GAME_TOPIC
     */
    onLoseGame: function() {
        this._startTrack(spaceship.sounds.LOSE_MUSIC, true);
    },

    /**
     * Plays a random game music track once.
     *
     * @subscribe START_GAME_TOPIC
     */
    onStartGame: function() {
        // pick a random song
        var track = this._randomChoice(spaceship.sounds.GAME_MUSIC);
        this._startTrack(track, false);
    },

    /**
     * Called when a non-looping game music track ends. Selects another
     * random track and plays it. Ensures the next track isn't the same as
     * the last.
     */
    onMusicDone: function(audio, response) {
        if(response.name != this._currentTrack) return;
        if(this._looping) {
            // start playing the track over again
            var curr = this._currentTrack;
            this._currentTrack = null;
            this._startTrack(curr, true);
        } else {
            do {
                // pick a different track randomly
                var track = this._randomChoice(spaceship.sounds.GAME_MUSIC);
            } while(track == this._currentTrack);
            this._startTrack(track, false);
        }
                
    }
});