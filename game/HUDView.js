/**
 * Heads up display of ships, shields, and ammo for the Spaceship! game.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
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
    
    postCreate: function() {
        // show initial values
        this.onUpdateDisplay();
        // listen for changes after each shot and minigame conclusion
        this.subscribe(spaceship.game.LAND_SHOT_TOPIC, 'onUpdateDisplay');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
    },
    
    uninitialize: function() {
        this.unsubscribeAll();
        console.debug('cleaning up hud view');
    },

    onEndGame: function() {
        this.destroyRecursive();
    },
    
    onUpdateDisplay: function(tile) {
        this._shipsNode.textContent = this.model.getShips();
        this._shieldsNode.textContent = this.model.getShields();
        this._ammoNode.textContent = this.model.getAmmo();
    }
});