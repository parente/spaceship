/**
 * Menu model code for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
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
    /**
     * Called after widget cleanup. Notifies all listeners that the menu is
     * ending.
     *
     * @publish END_MENU_TOPIC
     */
    uninitialize: function() {
        dojo.publish(spaceship.menu.END_MENU_TOPIC);
    },
    
    /**
     * Cancels the menu without choosing an option.
     *
     * @publish CANCEL_MENU_TOPIC
     */
    cancel: function() {
        if(this.cancelable) {
            dojo.publish(spaceship.menu.CANCEL_MENU_TOPIC);
            return true;
        }
        return false;
    },
    
    /**
     * Gets the title of the menu.
     *
     * @return String menu title
     */
    getTitle: function() {
        return this.title;
    },
    
    /**
     * Gets all of the menu labels.
     *
     * @return Array of strings
     */
    getLabels: function() {
        return this.labels;
    },
    
    /**
     * Selects the menu item at the given index as a potential choice for
     * completing the menu.
     *
     * @param index Integer index
     */
    selectIndex: function(index) {
        if(this.selectedItem == index) return;
        this.selectedItem = index;
        var label = this.labels[this.selectedItem];
        dojo.publish(spaceship.menu.SELECT_ITEM_TOPIC,
            [this.selectedItem, label]);
    },
    
    /**
     * Gets the label of the selected item.
     *
     * @return String label
     */
    getSelectedLabel: function() {
        return this.labels[this.selectedItem];
    },
    
    /**
     * Gets the index of the selected item.
     *
     * @return Integer index
     */
    getSelectedIndex: function() {
        return this.selectedItem;
    },

    /**
     * Moves the selection to the next item. Wraps around.
     */
    selectNext: function() {
        this.selectedItem = (this.selectedItem + 1) % this.labels.length;
        var label = this.labels[this.selectedItem];
        dojo.publish(spaceship.menu.SELECT_ITEM_TOPIC,
            [this.selectedItem, label]);
    },
    
    /**
     * Moves the selection to the previous item. Wraps around.
     */
    selectPrevious: function() {
        this.selectedItem -= 1;
        if(this.selectedItem < 0) {
            this.selectedItem = this.labels.length - 1;
        }
        var label = this.labels[this.selectedItem];
        dojo.publish(spaceship.menu.SELECT_ITEM_TOPIC,
            [this.selectedItem, label]);
    },
    
    /**
     * Chooses the currently selected item to end the menu.
     *
     * @publish CHOOSE_ITEM_TOPIC integer, string
     */
    chooseCurrent: function() {
        var label = this.labels[this.selectedItem];
        dojo.publish(spaceship.menu.CHOOSE_ITEM_TOPIC,
            [this.selectedItem, label]);
    }
});