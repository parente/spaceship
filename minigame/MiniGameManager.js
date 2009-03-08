/**
 * Minigame manager code for the Spaceship! game.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.GameModel');
dojo.require('dijit._Widget');
dojo.require('dijit._Container');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.sounds.AudioManager');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.minigame.Outcome');

dojo.declare('spaceship.game.GameModel', [dijit._Widget, 
                                          dijit._Contained,
                                          spaceship.utils.Subscriber], {
    // bundle of locale strings
    labels: null,
    // bundle of game config
    config: null,
    // audio manager
    audio: spaceship.sounds.AudioManager,
    postMixInProperties: function() {
        
    },
    
    uninitialize: function() {
        
    },
    
    /**
     * Called when the minigame panel shows. Gives keyboard focus to the 
     * root domNode.
     */
    onShow: function() {
        dijit.focus(this.domNode);
    },
    
    onEndGame: function() {
        this.destroyRecursive();
    }
});