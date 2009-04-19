/**
 * Range option type for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.preferences.types.RangeType');
dojo.require('dojo.string');
dojo.require('spaceship.preferences.types.OptionType');

dojo.declare('spaceship.preferences.types.RangeType', spaceship.preferences.types.OptionType, {
    // minimum value
    minimum: 0,
    // maximum value
    maximum: 0,
    // unit label
    unitLabel: '',
    setValue: function(value) {
        if(value < this.minimum) {
            value = minimum;
        } else if(value > this.maximum) {
            value = maximum;
        }
        this.value = value;
    },

    getValueLabel: function() {
        return dojo.string.substitute(this.unitLabel, [this.value]);
    }
});
