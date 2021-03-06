/**
 * Boolean option type for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.preferences.types.BooleanType');
dojo.require('dojo.i18n');
dojo.require('spaceship.preferences.types.OptionType');
dojo.requireLocalization('spaceship.preferences', 'labels');

dojo.declare('spaceship.preferences.types.BooleanType', spaceship.preferences.types.OptionType, {
    /**
     * Replaces the base class method to return yes/no labels for true/false.
     */
    getValueLabel: function() {
        var labels = dojo.i18n.getLocalization('spaceship.preferences', 'labels');
        return labels.BOOLEAN_TYPE_LABELS[Number(this.value)];
    },

    /**
     * Toggles between two possible values, true or false.
     */
    toggleValue: function() {
        this.setValue(!this.value);
    }
});
