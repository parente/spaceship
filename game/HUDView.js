/**
 * Heads up display of ships, shields, and ammo for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.HUDView');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.images.GraphicsManager');

dojo.declare('spaceship.game.HUDView', [dijit._Widget, 
                                        dijit._Templated,
                                        spaceship.utils.Subscriber], {
    // bundle of locale strings
    labels: null,
    // bundle of game config
    config: null,
    // game model
    model: null,
    // path to template file
    templatePath: dojo.moduleUrl('spaceship', 'templates/HUDView.html'),

    /**
     * Called after widget construction.
     */
    postMixInProperties: function() {
        // barrier to notify on message done
        this._barrier = null;
        // provide template values
        this._logoLabel = this.labels.GAME_TITLE;
        this._shipsLabel = this.labels.HUD_SHIPS;
        this._shieldsLabel = this.labels.HUD_SHIELDS;
        this._ammoLabel = this.labels.HUD_AMMO;
        this._logoImage = spaceship.images.LOGO_IMAGE;
        this._shipsImage = spaceship.images.SHIP_TILE_IMAGE;
        this._shieldsImage = spaceship.images.SHIELD_TILE_IMAGE;
        this._ammoImage = spaceship.images.AMMO_TILE_IMAGE;
    },
    
    /**
     * Called after widget creation. Subscribes to game topics and shows the
     * initial game status.
     */
    postCreate: function() {
        // show initial values
        this.onUpdateDisplay();
        // listen for changes after each shot and minigame conclusion
        this.subscribe(spaceship.game.END_MINIGAME_TOPIC, 'onUpdateDisplay');
        this.subscribe(spaceship.game.LAND_SHOT_TOPIC, 'onUpdateDisplay');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
    },
    
    /**
     * Called after widget cleanup. Unsubscribes from all topics.
     */
    uninitialize: function() {
        this.unsubscribeAll();
    },

    /**
     * Called when the game is ending. Destroys this widget.
     *
     * @subscribe END_GAME_TOPIC
     */
    onEndGame: function() {
        this.destroyRecursive();
    },
    
    /**
     * Called after a game phase, shooting or minigame, completes. Updates
     * the ship, shields, ammo count.
     *
     * @subscribe END_MINIGGAME_TOPIC, LAND_SHOT_TOP
     */
    onUpdateDisplay: function(tile) {
        this._shipsNode.textContent = this.model.getShips();
        this._shieldsNode.textContent = this.model.getShields();
        this._ammoNode.textContent = this.model.getAmmo();
    }
});