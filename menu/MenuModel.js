/**
 * Menu model code for the Spaceship! game.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.menu.MenuModel');
dojo.require('dijit._Widget');
dojo.require('spaceship.menu.MenuTopics');

dojo.declare('spaceship.menu.MenuModel', dijit._Widget, {
    // array of menu option labels
    labels: null,
    // optional menu title / prompt
    title: '',
    // currently selected menu item index
    selectedItem: 0,
    // can cancel menu and return to main
    cancelable: false,    
    uninitialize: function() {
        dojo.publish(spaceship.menu.END_MENU_TOPIC);
    },
    
    cancel: function() {
        if(this.cancelable) {
            dojo.publish(spaceship.menu.CANCEL_MENU_TOPIC);
            return true;
        }
        return false;
    },
    
    getTitle: function() {
        return this.title;
    },
    
    getLabels: function() {
        return this.labels;
    },
    
    selectIndex: function(index) {
        if(this.selectedItem == index) return;
        this.selectedItem = index;
        var label = this.labels[this.selectedItem];
        dojo.publish(spaceship.menu.SELECT_ITEM_TOPIC,
            [this.selectedItem, label]);
    },
    
    getSelectedLabel: function() {
        return this.labels[this.selectedItem];
    },
    
    getSelectedIndex: function() {
        return this.selectedItem;
    },

    selectNext: function() {
        this.selectedItem = (this.selectedItem + 1) % this.labels.length;
        var label = this.labels[this.selectedItem];
        dojo.publish(spaceship.menu.SELECT_ITEM_TOPIC,
            [this.selectedItem, label]);
    },
    
    selectPrevious: function() {
        this.selectedItem -= 1;
        if(this.selectedItem < 0) {
            this.selectedItem = this.labels.length - 1;
        }
        var label = this.labels[this.selectedItem];
        dojo.publish(spaceship.menu.SELECT_ITEM_TOPIC,
            [this.selectedItem, label]);
    },
    
    chooseCurrent: function() {
        var label = this.labels[this.selectedItem];
        dojo.publish(spaceship.menu.CHOOSE_ITEM_TOPIC,
            [this.selectedItem, label]);
    }
});