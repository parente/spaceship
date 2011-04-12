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
    itemLabels: null,
    // optional menu title / prompt
    title: '',
    // currently selected menu item index
    selectedIndex: 0,
    // can cancel menu and return to main
    cancelable: false,
    /**
     * Called after widget construction.
     */
    postMixInProperties: function() {
        // is the menu in an interrupted state?
        this._paused = false;
    },
    
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
     * Notifies that the menu is resuming after an interruption.
     */
    resume: function() {
        if(this._paused) {
            dojo.publish(spaceship.menu.RESUME_MENU_TOPIC);
        }
        this._paused = false;
    },
    
    /**
     * Notifies that the menu is pausing for an interruption.
     */
    pause: function() {
        if(!this._paused) {
            dojo.publish(spaceship.menu.PAUSE_MENU_TOPIC);
        }
        this._paused = true;
    },
    
    /**
     * Gets if the menu is paused or active.
     */
    isPaused: function() {
        return this._paused;
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
        return this.itemLabels;
    },
    
    /**
     * Selects the menu item at the given index as a potential choice for
     * completing the menu.
     *
     * @param index Integer index
     */
    selectIndex: function(index) {
        if(this.selectedIndex == index) return;
        this.selectedIndex = index;
        var label = this.itemLabels[this.selectedIndex];
        dojo.publish(spaceship.menu.SELECT_ITEM_TOPIC,
            [this.selectedIndex, label]);
    },
    
    /**
     * Gets the label of the selected item.
     *
     * @return String label
     */
    getSelectedLabel: function() {
        return this.itemLabels[this.selectedIndex];
    },
    
    /**
     * Gets the index of the selected item.
     *
     * @return Integer index
     */
    getSelectedIndex: function() {
        return this.selectedIndex;
    },

    /**
     * Moves the selection to the next item. Wraps around.
     */
    selectNext: function() {
        this.selectedIndex = (this.selectedIndex + 1) % this.itemLabels.length;
        var label = this.itemLabels[this.selectedIndex];
        dojo.publish(spaceship.menu.SELECT_ITEM_TOPIC,
            [this.selectedIndex, label]);
    },
    
    /**
     * Moves the selection to the previous item. Wraps around.
     */
    selectPrevious: function() {
        this.selectedIndex -= 1;
        if(this.selectedIndex < 0) {
            this.selectedIndex = this.itemLabels.length - 1;
        }
        var label = this.itemLabels[this.selectedIndex];
        dojo.publish(spaceship.menu.SELECT_ITEM_TOPIC,
            [this.selectedIndex, label]);
    },
    
    /**
     * Chooses the currently selected item to end the menu.
     *
     * @publish CHOOSE_ITEM_TOPIC integer, string
     */
    chooseCurrent: function() {
        var label = this.itemLabels[this.selectedIndex];
        dojo.publish(spaceship.menu.CHOOSE_ITEM_TOPIC,
            [this.selectedIndex, label]);
    }
});