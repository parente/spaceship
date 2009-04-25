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
    // default value
    defaultValue: null,
    constructor: function(args) {
        dojo.mixin(this, args);
        console.debug(this.id, 'VALUE', this.value);
        if(this.value == null || this.value == undefined || isNaN(this.value)) {
            this.value = this.defaultValue;
        }
        console.debug(this.id, 'VALUE', this.value);
    },
    
    getValue: function() {
        return this.value;
    },

    setValue: function(value) {
        this.value = value;
        dojo.publish(spaceship.preferences.UPDATE_PREFERENCE_TOPIC, 
            [this.id]);
    },
    
    getId: function(value) {
        return this.id;
    },
    
    getLabel: function() {
        return this.label;
    },
    
    getValueLabel: function() {
        return this.value;
    },
    
    reset: function() {
        this.setValue(this.defaultValue);
    }
});
