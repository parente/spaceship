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
        // token for game music end callback
        this._soundToken = null;
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
     * Plays a music track in a loop.
     *
     * @param track URL of the music to play
     * @param volume Float volume level 0.0 to 1.0
     */
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
            volume = this.prefs.musicVolume.value;
        }
        this.audio.setPropertyNow('volume', volume, spaceship.sounds.MUSIC_CHANNEL); 
        this.audio.setPropertyNow('loop', true, spaceship.sounds.MUSIC_CHANNEL);
        this.audio.stream(track, spaceship.sounds.MUSIC_CHANNEL);
        this._currentTrack = track;
    },

    /**
     * Plays the title music in a loop.
     *
     * @subscribe START_MAIN_MENU_TOPIC
     */
    onStartTitle: function() {
        this._playLooping(spaceship.sounds.TITLE_MUSIC);
    },
    
    /**
     * Plays the win music in a loop.
     *
     * @subscribe WIN_GAME_TOPIC
     */
    onWinGame: function() {
        this._playLooping(spaceship.sounds.WIN_MUSIC, 0.8);
    },
    
    /**
     * Plays the lose music in a loop.
     *
     * @subscribe LOSE_GAME_TOPIC
     */
    onLoseGame: function() {
        this._playLooping(spaceship.sounds.LOSE_MUSIC, 0.8);
    },

    /**
     * Plays a random game music track once.
     *
     * @subscribe START_GAME_TOPIC
     */
    onStartGame: function() {
        // stop current music
        this.audio.stop(spaceship.sounds.MUSIC_CHANNEL);
        // make sure volume is set properly
        this.audio.setPropertyNow('volume', this.prefs.musicVolume.value, 
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

    /**
     * Called when a non-looping game music track ends. Selects another
     * random track and plays it. Ensures the next track isn't the same as
     * the last.
     */
    onGameMusicDone: function() {
        do {
            var track = this._randomChoice(spaceship.sounds.GAME_MUSIC);
        } while(this._currentTrack == track);
        // make sure volume is set properly
        this.audio.setPropertyNow('volume', this.prefs.musicVolume.value, 
            spaceship.sounds.MUSIC_CHANNEL);
        this.audio.stream(track, spaceship.sounds.MUSIC_CHANNEL);        
        this._currentTrack = track;
    }
});