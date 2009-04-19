/**
 * Options menu model code for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.menu.options.OptionsMenuModel');
dojo.require('spaceship.menu.MenuModel');
dojo.require('spaceship.menu.options.OptionsMenuTopics');

dojo.declare('spaceship.menu.options.OptionsMenuModel', spaceship.menu.MenuModel, {
    // user preferences
    prefs: null,
    // bundle of labels
    labels: null,
    postMixInProperties: function() {
        this.inherited(arguments);
    },
    
    getSelectedType: function() {
        return this.optionTypes[this.selectedIndex];
    },
    
    getSelectedId: function() {
        return this.optionIds[this.selectedIndex];
    },
    
    changeSelectedValue: function() {
        
    }
});