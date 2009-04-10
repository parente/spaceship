/**
 * Game grid tiles for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.Tile');
dojo.require('spaceship.game.GameTopics');

dojo.declare('spaceship.game.Tile', null, {
    // index of the tile
    index: -1,
    // bundle of game config
    config: null,
    // bundle of labels
    labels: null,
    /**
     * Object constructor. Mixes arguments into this object.
     */
    constructor: function(args) {
        dojo.mixin(this, args);
        // value of the tile
        this._value = null;
        // true if the tile is revealed
        this._revealed = false;
    },
    
    /**
     * Selects a random value between one and maxBonusTileValue or 
     * maxHazardTileValue inclusive. Multiply the result by the multiplier
     * to produce a positive or negative value.
     *
     * @param multiplier Signed integer
     * @return Signed integer
     */
    _randomValue: function(multiplier) {
        var max;
        if(multiplier > 0) {
            max = this.config.maxBonusTileValue;
        } else if(multiplier < 0) {
            max = this.config.maxHazardTileValue;
        } else {
            max = 1;
        }
        return (Math.floor(Math.random() * max) + 1) * multiplier;
    },
    
    /**
     * Called when a shot hits this tile. Notifies listeners of the hit. 
     *
     * @publish LAND_SHOT_TOPIC
     */
    notify: function(model) {
        // notify listeners of hit tile
        dojo.publish(spaceship.game.LAND_SHOT_TOPIC, [this]);
    },

    /**
     * Reveals this tile.
     *
     * @param model Game model object
     */
    shoot: function(model) {
        // nothing to do if already showing
        if(this._revealed) return false;
        this._revealed = true;
        this.notify(model);
        return true;
    },
    
    /**
     * Gets if this tile is revealed or not.
     *
     * @return True if revealed, false if not
     */
    isRevealed: function() {
        return this._revealed;
    },
    
    /**
     * Gets if this tile holds a ship or not.
     *
     * @return True if contains a ship, false if not
     */
    isShip: function() {
        return false;
    },
    
    /**
     * Gets the value of this reward or hazard tile.
     *
     * @return Signed integer
     */
    getValue: function() {
        return this._value;
    },
    
    /**
     * Gets a localized label describing the contents of this revealed tile.
     *
     * @return String
     */
    getLabel: function() {
        // abstract method
    }
});

// Ship tile
dojo.declare('spaceship.game.ShipTile', spaceship.game.Tile, {
    notify: function(model) {
        model.hitShip();
        this.inherited(arguments);
    },
    
    isShip: function() {
        return true;
    },
    
    getLabel: function() {
        return this.labels.SHIP_TILE;
    }
});

// Neutral tiles

dojo.declare('spaceship.game.EmptyTile', spaceship.game.Tile, {
    notify: function(model) {
        model.missShip();
        this.inherited(arguments);
    },
    
    getLabel: function() {
        return this.labels.EMPTY_TILE;
    }
});

// Good tiles

dojo.declare('spaceship.game.AmmoTile', spaceship.game.Tile, {
    constructor: function(args) {
        // pick a value based on difficulty
        this._value = this._randomValue(1);
    },
    
    notify: function(model) {
        model.changeAmmo(this._value);
        this.inherited(arguments);
    },
    
    getLabel: function() {
        return this.labels.AMMO_TILE;
    }    
});

dojo.declare('spaceship.game.ShieldTile', spaceship.game.Tile, {
    constructor: function(args) {
        // pick a value based on difficulty
        this._value = this._randomValue(1);
    },
    
    notify: function(model) {
        model.changeShields(this._value);
        this.inherited(arguments);
    },
    
    getLabel: function() {
        return this.labels.SHIELD_TILE;
    }
});

dojo.declare('spaceship.game.HintTile', spaceship.game.Tile, {
    notify: function(model) {
        model.detectShip();
        this.inherited(arguments);
    },
    
    getLabel: function() {
        return this.labels.HINT_TILE;
    }
});

// Bad tiles

dojo.declare('spaceship.game.LeechTile', spaceship.game.Tile, {
    constructor: function(args) {
        // pick a value based on difficulty
        this._value = this._randomValue(-1);
    },
    
    notify: function(model) {
        model.changeAmmo(this._value);
        this.inherited(arguments);
    },
    
    getLabel: function() {
        return this.labels.LEECH_TILE;
    }
});

dojo.declare('spaceship.game.BombTile', spaceship.game.Tile, {
    constructor: function(args) {
        // pick a value based on difficulty
        this._value = this._randomValue(-1);
    },
    
    notify: function(model) {
        model.changeShields(this._value);        
        this.inherited(arguments);
    },
    
    getLabel: function() {
        return this.labels.BOMB_TILE;
    }
});

dojo.declare('spaceship.game.WarpTile', spaceship.game.Tile, {
    constructor: function(args) {
        // pick a value based on difficulty
        this._value = Math.abs(this._randomValue(-1));
    },
    
    notify: function(model) {
        model.warpTime(this._value);
        this.inherited(arguments);
    },
    
    getLabel: function() {
        return this.labels.WARP_TILE;
    }
});

// cumulative probabilities of good, neutral, and bad tiles used during game
// grid initialization
spaceship.game.GOOD_TILES = [
    {klass: spaceship.game.HintTile, cumProb: 0.2},
    {klass: spaceship.game.ShieldTile, cumProb: 0.4},
    {klass: spaceship.game.AmmoTile, cumProb: 1.0}
];
spaceship.game.NEUTRAL_TILES = [
    {klass: spaceship.game.EmptyTile, cumProb: 1.0}
];
spaceship.game.BAD_TILES = [
    {klass: spaceship.game.WarpTile, cumProb : 0.1},
    {klass: spaceship.game.BombTile, cumProb: 0.5},
    {klass: spaceship.game.LeechTile, cumProb: 1.0}
];
