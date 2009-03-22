/**
 * Minigame outcome for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.minigame.Outcome');

dojo.declare('spaceship.minigame.Outcome', null, {
    // bundle of game config
    config: null,
    // bundle of labels
    labels: null,
    constructor: function(args) {
        dojo.mixin(this, args);
        // value of the outcome
        this._value = null;
    },
    
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

    getLabel: function() {
        // abstract method
    },
    
    win: function(model) {
        // abstract method
    },
    
    lose: function(model) {
        // abstract method
    }
});

dojo.declare('spaceship.minigame.AmmoReward', spaceship.minigame.Outcome, {
    constructor: function(args) {
        this._value = this._randomValue(1);
    },

    getLabel: function() {
        return this.labels.AMMO_MINIGAME_MESSAGE;
    },
    
    win: function(model) {
        model.changeAmmo(this._value);
    }
});

dojo.declare('spaceship.minigame.ShieldReward', spaceship.minigame.Outcome, {
    constructor: function(args) {
        this._value = this._randomValue(1);
    },
    
    getLabel: function() {
        return this.labels.SHIELDS_MINIGAME_MESSAGE;
    },

    win: function(model) {
        model.changeShields(this._value);
    }
});

dojo.declare('spaceship.minigame.BombHazard', spaceship.minigame.Outcome, {
    constructor: function(args) {
        this._value = this._randomValue(-1);
    },

    getLabel: function() {
        return this.labels.BOMBS_MINIGAME_MESSAGE;
    },
    
    lose: function(model) {
        console.debug('lose bomb!!!!!!!!!');
        model.changeShields(this._value);
    }
});

dojo.declare('spaceship.minigame.WarpHazard', spaceship.minigame.Outcome, {
    constructor: function(args) {
        // pick a value based on difficulty
        this._value = Math.abs(this._randomValue(-1));
    },
    
    getLabel: function() {
        return this.labels.WARPS_MINIGAME_MESSAGE;
    },
    
    lose: function(model) {
        model.warpTime(this._value);
    }
});

spaceship.minigame.GOOD_OUTCOMES = [
    {klass: spaceship.minigame.AmmoReward, cumProb: 0.8},
    {klass: spaceship.minigame.ShieldReward, cumProb: 1.0}
];
spaceship.minigame.BAD_OUTCOMES = [
    {klass: spaceship.minigame.BombHazard, cumProb: 0.8},
    {klass: spaceship.minigame.WarpHazard, cumProb: 1.0},
];