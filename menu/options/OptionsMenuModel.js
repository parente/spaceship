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
    
    resetAll: function() {
        dojo.forEach(this._itemObjects, function(item) { item.reset(); });
    },
    
    getItemObjects: function() {
        return this._itemObjects;
    },
    
    getIdByIndex: function(index) {
        return this._itemObjects[index].getId();
    },
    
    getIndexById: function(key) {
        return this._itemIds.indexOf(key);
    },
    
    getItemById: function(key) {
        return this.prefs[key];
    },
    
    getItemByIndex: function(index) {
        return this._itemObjects[index];
    },

    getSelectedItem: function() {
        return this._itemObjects[this.selectedIndex];
    },
    
    setSelectedValue: function(value) {
        this._itemObjects[this.selectedIndex].setValue(value);
    },
    
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