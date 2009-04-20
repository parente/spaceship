/**
 * Base class option type for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.preferences.types.OptionType');
dojo.provide('spaceship.preferences.PreferencesTopics');

dojo.declare('spaceship.preferences.types.OptionType', null, {
    // programmatic identifier, unique across all preferences
    id: '',
    // human readable label of the preference
    label : '',
    // current value
    value: null,
    constructor: function(args) {
        dojo.mixin(this, args);
    },
    
    getValue: function() {
        return this.value;
    },

    setValue: function(value) {
        this.value = value;
        dojo.publish(spaceship.preferences.UPDATE_PREFERENCES_TOPIC);
    },
    
    getId: function(value) {
        return this.id;
    },
    
    getLabel: function() {
        return this.label;
    },
    
    getValueLabel: function() {
        return this.value;
    }
});
