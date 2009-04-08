/**
 * Minigame base class for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.minigame.MiniGame');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('spaceship.minigame.MiniGame', [dijit._Widget,
                                             dijit._Templated], {
    // audio manager instance set by the minigame manager
    audio: null,
    // topic to broadcast on a win set by the minigame manager
    win_topic: '',
    // topic to broadcast on a win set by the minigame manager
    lose_topic: '',
    // path to CSS to load for this widget; throwback to dojo 0.4 for minigames
    templateCSSPath: '',
    constructor: function() {
        this._audioTok = null;
        this._audioDefs = {};
    },
    
    /**
     * Stops observing audio callbacks.
     */
    uninitialize: function() {
        if(this._audioTok) {
            this.audio.removeObserver(this._audioTok);
            this._audioTok = null;
        }
        this._audioDefs = null;
    },
    
    /**
     * Returns a deferred response when a sound or utterance finishes
     * completely or because of an interruption.
     */
    _onAudioNotice: function(audio, response) {
        var def = this._audioDefs[response.name];
        if(def) {
            delete this._audioDefs[response.name];
            def.callback(true);
        }
    },

    /**
     * Loads the stylesheet for the minigame if it needs one.
     */
    postMixInProperties: function() {
        // register for audio notifications immediately
        var cb = dojo.hitch(this, '_onAudioNotice');
        this._audioTok = this.audio.addObserver(cb,
            spaceship.sounds.MINIGAME_CHANNEL, 
            ['started-say', 'started-play']);
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
     * @return dojo.Deferred notified if/when the utterance ends
     */   
    say: function(text, stop) {
        console.debug('mg say', text, stop);
        if(stop) {
            this.audio.stop(spaceship.sounds.MINIGAME_CHANNEL);
        }
        var key = Math.random() + '';
        var def = new dojo.Deferred();
        this._audioDefs[key] = def;
        this.audio.say(text, spaceship.sounds.MINIGAME_CHANNEL, key);
        return def;
    },
    
    /**
     * Downloads and plays or streams a sound at the given relative or
     * absolute URL.
     *
     * @param String URL
     * @param stop True to stop previous sound before playing, false to queue
     * @param stream True to stream the sound instead of downloading it before
     *   playing it
     */
    play: function(url, stop, stream) {
        if(stop) {
            this.audio.stop(spaceship.sounds.MINIGAME_CHANNEL);
        }
        var key = Math.random() + '';
        var def = new dojo.Deferred();
        this._audioDefs[key] = def;
        if(stream) {
            this.audio.stream(url, spaceship.sounds.MINIGAME_CHANNEL, key); 
        } else {
            this.audio.play(url, spaceship.sounds.MINIGAME_CHANNEL, key);
        }
        return def;
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
