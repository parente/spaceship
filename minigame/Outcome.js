/**
 * Minigame outcome for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.minigame.Outcome');
dojo.require('spaceship.sounds.AudioManager')
dojo.require('dojo.string');

dojo.declare('spaceship.minigame.Outcome', null, {
    // bundle of game config
    config: null,
    // bundle of labels
    labels: null,
    // bundle of sounds
    sounds: spaceship.sounds,
    /**
     * Object constructor. Mixes arguments into this object.
     */
    constructor: function(args) {
        dojo.mixin(this, args);
        // value of the outcome
        this._value = null;
        // win or lose
        this._win = null;
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
     * Gets the outcome description for a minigame win.
     *
     * @return String description
     */
    _getWinLabel: function() {
        // abstract method
    },

    /**
     * Gets the outcome description for a minigame loss.
     *
     * @return String description
     */    
    _getLoseLabel: function() {
        // abstract method
    },
    
    /**
     * Gets the outcome sound for a minigame win.
     *
     * @return String URL to the sound
     */
    _getWinSoundUrl: function() {
        // abstract method
    },

    /**
     * Gets the outcome sound for a minigame loss.
     *
     * @return String URL to the sound
     */    
    _getLoseSoundUrl: function() {
        // abstract method
    },

    /**
     * Gets the description of a potential outcome.
     *
     * @return String URL to the sound
     */
    getLabel: function() {
        // abstract method
    },
    
    /**
     * Gets the description of the minigame result, win or loss.
     *
     * @return String description
     */
    getResultLabel: function() {
        if(this._win == null) {
            throw new Error('result not determined');
        } else if(this._win == true) {
            return this._getWinLabel();
        } else {
            return this._getLoseLabel();
        }
    },

    /**
     * Gets the sound for the minigame result, win or loss.
     *
     * @return String URL to the sound
     */    
    getResultSoundUrl: function() {
        if(this._win == null) {
            throw new Error('result not determined');
        } else if(this._win == true) {
            return this._getWinSoundUrl();
        } else {
            return this._getLoseSoundUrl();
        }
    },
    
    /**
     * Sets the minigame outcome to a win.
     *
     * @param model spaceship.game.GameModel instance
     */
    win: function(model) {
        this._win = true;
    },
    
    /**
     * Sets the minigame outcome to a loss.
     *
     * @param model spaceship.game.GameModel instance
     */
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
    
    _getWinSoundUrl: function() {
        return this.sounds.AMMO_TILE_SOUND;
    },
    
    _getLoseSoundUrl: function() {
        return this.sounds.LOSE_REWARD_SOUND;
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

    _getWinSoundUrl: function() {
        return this.sounds.SHIELD_TILE_SOUND;
    },
    
    _getLoseSoundUrl: function() {
        return this.sounds.LOSE_REWARD_SOUND;
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
    
    _getWinSoundUrl: function() {
        return this.sounds.AVOID_HAZARD_SOUND;
    },
    
    _getLoseSoundUrl: function() {
        return this.sounds.BOMB_TILE_SOUND;
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
    
    _getWinSoundUrl: function() {
        return this.sounds.AVOID_HAZARD_SOUND;
    },
    
    _getLoseSoundUrl: function() {
        return this.sounds.WARP_TILE_SOUND;
    },
    
    lose: function(model) {
        this.inherited(arguments);
        model.warpTime(this._value);
    }
});

// cumulative probabilities of good and bad minigame outcomes used during
// minigame initialization
spaceship.minigame.GOOD_OUTCOMES = [
    {klass: spaceship.minigame.AmmoReward, cumProb: 0.85},
    {klass: spaceship.minigame.ShieldReward, cumProb: 1.0}
];
spaceship.minigame.BAD_OUTCOMES = [
    {klass: spaceship.minigame.BombHazard, cumProb: 0.85},
    {klass: spaceship.minigame.WarpHazard, cumProb: 1.0},
];