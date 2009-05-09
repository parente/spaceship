/**
 * Percent range option type for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.preferences.types.PercentType');
dojo.require('dojo.string');
dojo.require('dojo.i18n');
dojo.require('spaceship.preferences.types.RangeType');
dojo.requireLocalization('spaceship.preferences', 'labels');

dojo.declare('spaceship.preferences.types.PercentType', spaceship.preferences.types.RangeType, {
    /** 
     * Extends the base class constructor to store the label for the units of
     * this type.
     */
    constructor: function() {
        // override user specified label to force to percentage
        var labels = dojo.i18n.getLocalization('spaceship.preferences', 'labels');
        this.unitLabel = labels.PERCENT_UNITS;
    },
    
    /**
     * Replaces the base class method to return the floating point value as a
     * human readable percentage out of 100.
     *
     * @return String label
     */
    getValueLabel: function() {
        var value = Math.round(this.value*100);
        return dojo.string.substitute(this.unitLabel, [value]);
    }
});
