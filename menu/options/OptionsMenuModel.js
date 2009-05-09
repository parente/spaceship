/**
 * Options menu model code for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.menu.options.OptionsMenuModel');
dojo.require('spaceship.menu.MenuModel');
dojo.require('spaceship.preferences.PreferencesModel');

dojo.declare('spaceship.menu.options.OptionsMenuModel', spaceship.menu.MenuModel, {
    // user preferences
    prefs: spaceship.preferences.PreferencesModel,
    // always cancellable
    cancelable: true,
    /**
     * Replaces the base class method to store option objects and labels
     * in menu order.
     */
    postMixInProperties: function() {
        // ordered item ids
        this._itemIds = [
            'speechRate', 
            'speechVolume',
            'soundVolume',
            'musicVolume',
            'mouseControl'
        ];
        // ordered item objects
        this._itemObjects = dojo.map(this._itemIds, function(id) {
            return this.prefs[id];
        }, this);
        // ordered labels, overriding whatever was passed
        this.itemLabels = dojo.map(this._itemObjects, function(obj) {
            return obj.getLabel();
        }, this);
    },
    
    /**
     * Resets all options to their defaults.
     */
    resetAll: function() {
        dojo.forEach(this._itemObjects, function(item) { item.reset(); });
    },
    
    /**
     * Gets all option objects.
     *
     * @return Array of spaceship.preferences.types.OptionTypes
     */
    getItemObjects: function() {
        return this._itemObjects;
    },
    
    /**
     * Gets the preference key of the option at the given menu index.
     *
     * @param Integer index
     * @return String pref name
     */
    getIdByIndex: function(index) {
        return this._itemObjects[index].getId();
    },
    
    /**
     * Gets the menu index of the preference with the given key.
     *
     * @param key String pref name
     * @return Integer index
     */
    getIndexById: function(key) {
        return this._itemIds.indexOf(key);
    },
    
    /**
     * Gets a preference by its key.
     *
     * @param key String pref name
     * @return spaceship.preferences.types.OptionType
     */
    getItemById: function(key) {
        return this.prefs[key];
    },
    
    /**
     * Gets a preference by its index.
     *
     * @param index Integer index
     * @return spaceship.preferences.types.OptionType
     */
    getItemByIndex: function(index) {
        return this._itemObjects[index];
    },

    /**
     * Gets the preference object for the selected index.
     *
     * @return spaceship.preferences.types.OptionType
     */
    getSelectedItem: function() {
        return this._itemObjects[this.selectedIndex];
    },
    
    /**
     * Sets the preference value of the selected preference.
     *
     * @param value New value to set
     */
    setSelectedValue: function(value) {
        this._itemObjects[this.selectedIndex].setValue(value);
    },
    
    /**
     * Increases or decreases the selected preference by its step amount.
     *
     * @param direction Positive integer for increase, negative for decrease
     */
    deltaSelectedValue: function(direction) {
        var obj = this._itemObjects[this.selectedIndex];
        // try increment/decrement methods
        if(direction > 0) {
            if(obj.incrementValue) {
                obj.incrementValue();
                return;
            }
        } else {
            if(obj.decrementValue) {
                obj.decrementValue();
                return;
            }
        }
        // didn't have a inc/dec method, so try toggling
        if(obj.toggleValue) {
            obj.toggleValue();
        }
    }
});