/**
 * Minigame base class for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.minigame.MiniGame');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('spaceship.utils.Timer');
dojo.require('spaceship.preferences.PreferencesModel');

dojo.declare('spaceship.minigame.MiniGame', [dijit._Widget,
                                             dijit._Templated], {
    // user preferences
    prefs: spaceship.preferences.PreferencesModel,
    // configuration for the minigame based on level only
    config: null,
    // audio manager instance set by the minigame manager
    audio: null,
    // topic to broadcast on a win set by the minigame manager
    win_topic: '',
    // topic to broadcast on a win set by the minigame manager
    lose_topic: '',
    // path to CSS to load for this widget; throwback to dojo 0.4 for minigames
    templateCSSPath: '',
    constructor: function() {
        this._origVolume = 1.0;
    },
    
    /**
     * Stops observing audio callbacks.
     */
    uninitialize: function() {
        // restore original volume
        this.audio.setProperty({name : 'volume', 
            value : this.prefs.speechVolume.value,
            channel : spaceship.sounds.MINIGAME_CHANNEL});
    },
    
    /**
     * Returns a deferred response when a sound or utterance finishes
     * completely or because of an interruption.
     */
    /*_onAudioNotice: function(audio, response) {
        var def = this._audioDefs[response.name];
        if(def) {
            if(response.action.search('started') == 0) {
                def.before.callback(true);
            } else {
                delete this._audioDefs[response.name];
                def.after.callback(true);
            }
        }
    },*/

    /**
     * Loads the stylesheet for the minigame if it needs one.
     */
    postMixInProperties: function() {
        // register for audio notifications immediately
        var cb = dojo.hitch(this, '_onAudioNotice');
        if(this.templateCSSPath) {
            var head = dojo.doc.getElementsByTagName("head")[0];         
            var cssNode = document.createElement('link');
            cssNode.type = 'text/css';
            cssNode.rel = 'stylesheet';
            cssNode.href = this.templateCSSPath;
            head.appendChild(cssNode);  
        }
    },
    
    /**
     * Helper method picks one random element from an array.
     *
     * @param arr An array
     * @return Random element from the array
     */
    pickRandom: function(arr) {
        if(!arr.length) throw new Error('empty array');
        var i = Math.floor(Math.random()*arr.length);
        return arr[i];
    },
    
    /**
     * Helper method picks N random elements from an array, allowing dupes.
     *
     * @param arr An array
     * @param n Integer number of elements to pick, defaults to 1 if undefined
     * @return Array of random elements
     */
    pickRandomN: function(arr, n) {
        if(!arr.length) throw new Error('empty array');
        n = n || 1;
        var rv = [];
        for(var i=0; i<n; i++) {
            var x = Math.floor(Math.random()*arr.length);
            rv.push(arr[x]);
        }
        return rv;
    },
    
    /**
     * Shuffles the array contents into random order inline.
     *
     * @param arr An array
     */
    shuffleRandom: function(arr) {
        var f = function() {
            return Math.round(Math.random()-0.5);
        };
        arr.sort(f);
    },
    
    /**
     * Starts a timer running. The caller can pause or resume the timer as
     * needed.
     *
     * @param seconds Duration of the timer in seconds
     */
    startTimer: function(seconds) {
        var timer = new spaceship.utils.Timer({duration : seconds});
        var def = timer.start();
        def.addCallback(this, 'onTimer');
        return timer;
    },

    /**
     * Ends a game in a win.
     */
    win: function() {
        dojo.publish(this.win_topic);
    },

    /**
     * Ends a game in a loss.
     */    
    lose: function() {
        dojo.publish(this.lose_topic);
    },

    /**
     * Speaks an utterance.
     *
     * @param text Utterance to speak
     * @param stop True to stop previous sound before playing, false to queue
     * @return JSonicDeferred
     */   
    say: function(text, stop) {
        if(stop) {
            this.audio.stop({channel : spaceship.sounds.MINIGAME_CHANNEL});
        }
        this.audio.setProperty({name : 'volume', 
            value : this.prefs.speechVolume.value,
            channel : spaceship.sounds.MINIGAME_CHANNEL});
        return this.audio.say({text : text, 
            channel : spaceship.sounds.MINIGAME_CHANNEL});
    },
    
    /**
     * Downloads and plays or streams a sound at the given relative or
     * absolute URL.
     *
     * @param String URL
     * @param stop True to stop previous sound before playing, false to queue
     * @return JSonicDeferred
     */
    play: function(url, stop) {
        if(stop) {
            this.audio.stop(spaceship.sounds.MINIGAME_CHANNEL);
        }
        this.audio.setProperty({name: 'volume', 
            value: this.prefs.soundVolume.value,
            channel : spaceship.sounds.MINIGAME_CHANNEL});
        return this.audio.play({url : url, 
            channel : spaceship.sounds.MINIGAME_CHANNEL});
    },
    
    /**
     * Stops all output and clears all queued commands, speech and sound.
     */
    stopAll: function() {
        this.audio.stop({channel : spaceship.sounds.MINIGAME_CHANNEL});
    },
    
    /**
     * Implement to return a URL to an HTML help page for the minigame,
     * relative to the module location for the game.
     *
     * @return String URL
     */
    onGetHelp: function() {
        return null;
    },
    
    /**
     * Implement to return a list of URLs, relative to the window URL or
     * absolute, of sound files to cache before the game starts.
     *
     * @return Array of string URLS
     */
    onGetPreCache: function() {
        return [];
    },
    
    /**
     * Called when a timer created by the minigame expires.
     *
     * @param timer Timer object that expired
     */
    onTimer: function(timer) {
        
    },
    
    /**
     * Called when the minigame is starting.
     */
    onStart: function() {
        
    },
    
    /**
     * Called when the minigame is paused by visiting a menu.
     */        
    onPause: function() {
        
    },
    
    /**
     * Called when the minigame is resumed after being paused.
     */
    onResume: function() {
        
    },
    
    /**
     * Called when the minigame is ending. The game should clean itself up
     * in here.
     */
    onEnd: function() {
        
    },
    
    /**
     * Called when the user presses and releases a key.
     *
     * @param event Dojo key event
     */
    onKeyPress: function(event) {

    },
    
    /**
     * Called when the user presses a key.
     *
     * @param event Dojo key event
     */
    onKeyDown: function(event) {
        
    },
    
    /**
     * Called when the user releases a key.
     *
     * @param event Dojo key event
     */
    onKeyUp: function(event) {
        
    }
});
