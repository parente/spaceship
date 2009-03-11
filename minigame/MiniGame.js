/**
 * Minigame base class for the Spaceship! game.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.minigame.MiniGame');
dojo.require('spaceship.sounds.AudioManager');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('spaceship.minigame.MiniGame', [dijit._Widget,
                                             dijit._Templated], {
    audio: null,
    visual: null,
    win_topic: '',
    lose_topic: '',
    templateString: '',

    win: function() {
        dojo.publish(this.win_topic);
    },
    
    lose: function() {
        dojo.publish(this.lose_topic);
    },
    
    say: function(text, stop) {
        if(stop) {
            this.audio.stop(spaceship.sounds.SPEECH_CHANNEL);
        }
        this.audio.say(text, spaceship.sounds.SPEECH_CHANNEL);
    },
    
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
    
    onGetHelp: function() {
        return '';
    },
    
    onPreCache: function() {
        return [];
    },

    onStart: function() {
        
    },
        
    onPause: function() {
        
    },
    
    onResume: function() {
        
    },
    
    onEnd: function() {
        
    },
    
    onKeyPress: function(event) {
        
    },
    
    onKeyDown: function(event) {
        
    },
    
    onKeyUp: function(event) {
        
    }
});
