/**
 * Minigame manager code for the Spaceship! game.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.minigame.MiniGameManager');
dojo.require('dijit._Widget');
dojo.require('dijit._Container');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.sounds.AudioManager');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.minigame.Outcome');

dojo.declare('spaceship.minigame.MiniGameManager', [dijit._Widget, 
                                                    dijit._Contained,
                                                    spaceship.utils.Subscriber], {
    // main game model
    model: null,
    // bundle of locale strings
    labels: null,
    // bundle of game config
    config: null,
    // audio manager
    audio: spaceship.sounds.AudioManager,
    postMixInProperties: function() {
        // barrier for minigame play
        this._barrier = null;
        // outcome of minigame
        this._outcome = null;
    },
    
    /**
     * Register for dojo.publish topics.
     */
    postCreate: function() {
        this.subscribe(spaceship.game.PLAY_MINIGAME_TOPIC, 'onStartMiniGame');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
    },
    
    /**
     * Unsubscribes from all topics during widget destruction. Removes widget
     * from its parent container.
     */
    uninitialize: function() {
        this.unsubscribeAll();
        var parent = this.getParent();
        parent.removeChild(this);
    },
    
    /**
     * Called when the minigame panel shows. Gives keyboard focus to the 
     * root domNode.
     */
    onShow: function() {
        dijit.focus(this.domNode);
    },
    
    /**
     * Called when the main game needs to start a new minigame. Picks a random
     * minigame to play and initializes it.
     *
     * @param bar Barrier to notify when game is done
     * @param outcome Outcome object to update
     */
    onStartMiniGame: function(bar, outcome) {
        this._barrier = bar;
        this._outcome = outcome;
        // @todo: pick a minigame and start it
        // notify starting minigame
        dojo.publish(spaceship.game.START_MINIGAME_TOPIC);
    },
    
    /**
     * Called when the main game ends. Cleans up the widget and its children.
     */
    onEndGame: function() {
        this.destroyRecursive();
    }
});