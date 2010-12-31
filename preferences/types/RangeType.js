/**
 * Range option type for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.preferences.types.RangeType');
dojo.require('spaceship.preferences.types.OptionType');

dojo.declare('spaceship.preferences.types.RangeType', spaceship.preferences.types.OptionType, {
    // minimum value
    minimum: 0,
    // maximum value
    maximum: 0,
    // step size
    step: 0,
    // unit label
    unitLabel: '',
    /**
     * Increments the value by the step.
     */
    incrementValue: function() {
        this.setValue(this.value + this.step);
    },
    
    /**
     * Decrements the value by the step.
     */
    decrementValue: function() {
        this.setValue(this.value - this.step);
    },

    /**
     * Extends the base class method to bound the new value to the allowed 
     * range.
     *
     * @param value New value
     */
    setValue: function(value) {
        if(value < this.minimum) {
            value = this.minimum;
        } else if(value > this.maximum) {
            value = this.maximum;
        }
        arguments[0] = value;
        this.inherited(arguments);
    },

    /**
     * Replaces the base class method to return the value with units attached.
     */
    getValueLabel: function() {
        return dojo.replace(this.unitLabel, [this.value]);
    }
});
