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
    // initial HTML to render in the game DOM node before game start
    templateString: '<div></div>',

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
     */   
    say: function(text, stop) {
        if(stop) {
            this.audio.stop(spaceship.sounds.SPEECH_CHANNEL);
        }
        this.audio.say(text, spaceship.sounds.SPEECH_CHANNEL);
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
            this.audio.stop(spaceship.sounds.SOUND_CHANNEL);
        }
        if(stream) {
            this.audio.stream(url, spaceship.sounds.SOUND_CHANNEL);            
        } else {
            this.audio.play(url, spaceship.sounds.SOUND_CHANNEL);
        }
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
