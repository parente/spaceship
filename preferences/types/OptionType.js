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
    /**
     * Object constructor. Mixes provided arguments into this instance.
     */
    constructor: function(args) {
        dojo.mixin(this, args);
        if(this.value == null || this.value == undefined || isNaN(this.value)) {
            this.value = this.defaultValue;
        }
    },
    
    /**
     * Gets the current value of this option.
     *
     * @return Current value
     */
    getValue: function() {
        return this.value;
    },

    /**
     * Sets the value of this option.
     *
     * @param value New value
     */
    setValue: function(value) {
        this.value = value;
        dojo.publish(spaceship.preferences.UPDATE_PREFERENCE_TOPIC, 
            [this.id]);
    },
    
    /** 
     * Gets the ID or key of this option uniquely identifying it among all
     * global preferences.
     */
    getId: function() {
        return this.id;
    },
    
    /**
     * Gets the human readable label of this option.
     *
     * @return String label
     */
    getLabel: function() {
        return this.label;
    },
    
    /**
     * Gets the human readable label of the value of this option.
     *
     * @return String label
     */
    getValueLabel: function() {
        return this.value;
    },
    
    /**
     * Resets this option to its default value.
     */
    reset: function() {
        this.setValue(this.defaultValue);
    }
});
