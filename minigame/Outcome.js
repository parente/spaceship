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
    
    win: function() {
        // abstract method
    },
    
    lose: function() {
        // abstract method
    }
});

dojo.declare('spaceship.minigame.AmmoReward', spaceship.minigame.Outcome, {
    getLabel: function() {
        return this.labels.EARN_AMMO_MESSAGE;
    }
});

dojo.declare('spaceship.minigame.ShieldReward', spaceship.minigame.Outcome, {
    getLabel: function() {
        return this.labels.EARN_SHIELD_MESSAGE;
    }
});

dojo.declare('spaceship.minigame.FireHazard', spaceship.minigame.Outcome, {
    getLabel: function() {
        return this.labels.AVOID_FIRE_MESSAGE;
    }    
});

dojo.declare('spaceship.minigame.WarpHazard', spaceship.minigame.Outcome, {
    getLabel: function() {
        return this.labels.AVOID_WARP_MESSAGE;
    }
});

spaceship.minigame.GOOD_OUTCOMES = [
    
    {klass: spaceship.minigame.AmmoReward, cumProb: 0.8},
    {klass: spaceship.minigame.ShieldReward, cumProb: 1.0}
];
spaceship.minigame.BAD_OUTCOMES = [
    {klass: spaceship.minigame.FireHazard, cumProb: 0.8},
    {klass: spaceship.minigame.WarpHazard, cumProb: 1.0},
];