/**
 * Minigame outcome for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.minigame.Outcome');
dojo.require('dojo.string');

dojo.declare('spaceship.minigame.Outcome', null, {
    // bundle of game config
    config: null,
    // bundle of labels
    labels: null,
    constructor: function(args) {
        dojo.mixin(this, args);
        // value of the outcome
        this._value = null;
        // win or lose
        this._win = null;
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
    
    _getWinLabel: function() {
        // abstract method
    },
    
    _getLoseLabel: function() {
        // abstract method
    },

    getLabel: function() {
        // abstract method
    },
    
    getResultLabel: function() {
        if(this._win == null) {
            throw new Error('result not determined');
        } else if(this._win == true) {
            return this._getWinLabel();
        } else {
            return this._getLoseLabel();
        }
    },
    
    win: function(model) {
        this._win = true;
    },
    
    lose: function(model) {
        this._win = false;
    }
});

dojo.declare('spaceship.minigame.AmmoReward', spaceship.minigame.Outcome, {
    constructor: function(args) {
        this._value = this._randomValue(1);
    },

    getLabel: function() {
        return this.labels.AMMO_MINIGAME_MESSAGE;
    },
    
    _getWinLabel: function() {
        if(this._value == 1) {
            return this.labels.WIN_AMMO_MESSAGE;
        } else {
            var template = this.labels.WIN_AMMOS_MESSAGE;
            return dojo.string.substitute(template, {ammo : this._value});
        }
    },
    
    _getLoseLabel: function() {
        return this.labels.LOSE_AMMO_MESSAGE;
    },
    
    win: function(model) {
        this.inherited(arguments);
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
    
    _getWinLabel: function() {
        if(this._value == 1) {
            return this.labels.WIN_SHIELD_MESSAGE;
        } else {
            var template = this.labels.WIN_SHIELDS_MESSAGE;
            return dojo.string.substitute(template, {shields : this._value});
        }
    },
    
    _getLoseLabel: function() {
        return this.labels.LOSE_SHIELD_MESSAGE;
    },

    win: function(model) {
        this.inherited(arguments);
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
    
    _getWinLabel: function() {
        return this.labels.WIN_BOMB_MESSAGE;
    },
    
    _getLoseLabel: function() {
        var value = Math.abs(this._value);
        if(value == 1) {
            return this.labels.LOSE_BOMB_MESSAGE;
        } else {
            var template = this.labels.LOSE_BOMBS_MESSAGE;
            return dojo.string.substitute(template, {shields : value});
        }
    },
    
    lose: function(model) {
        this.inherited(arguments);
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
    
    _getWinLabel: function() {
        return this.labels.WIN_WARP_MESSAGE;
    },
    
    _getLoseLabel: function() {
        var value = Math.abs(this._value);
        if(value == 1) {
            return this.labels.LOSE_WARP_MESSAGE;
        } else {
            var template = this.labels.LOSE_WARPS_MESSAGE;
            return dojo.string.substitute(template, {ships : value});
        }
    },
    
    lose: function(model) {
        this.inherited(arguments);
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