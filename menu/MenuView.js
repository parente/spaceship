/**
 * List view/controller for a Spaceship! game menu model.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.menu.MenuView');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Container');
dojo.require('spaceship.menu.MenuTopics');
dojo.require('spaceship.utils.Subscriber');

// @todo: factor out menu controller
dojo.declare('spaceship.menu.MenuView', [dijit._Widget, 
                                         dijit._Templated,
                                         dijit._Contained,
                                         spaceship.utils.Subscriber], {
    // menu model
    model: null,
    // array of image urls to use in place of text labels if available
    images: null,
    // array of selected image urls to use in place of text labels if available
    selectedImages: null,
    // user preferences
    prefs: spaceship.preferences.PreferencesModel,
    // path to template file
    templatePath: dojo.moduleUrl('spaceship', 'templates/MenuView.html'),
    /**
     * Called after widget construction.
     */
    postMixInProperties: function() {
        this._title = this.model.getTitle();
    },
    
    /**
     * Called after widget creation. Builds the visual menu items. Subscribes
     * to menu topics.
     */
    postCreate: function() {
        // hide title if no text
        if(!this._title) {
            this._titleNode.style.display = 'none';
        }
        
        // add labels to the DOM
        var labels = this.model.getLabels();
        for(var i=0; i < labels.length; i++) {
            var li = dojo.doc.createElement('li');
            dojo.addClass(li, 'ssMenuViewLabel');
            if(i == this.model.getSelectedIndex()) {
                // select the current item
                dojo.addClass(li, 'ssMenuViewLabelSelected');
            }
            this.connect(li, 'onclick', dojo.hitch(this, this.onClick, i));
            this.connect(li, 'onmouseover', dojo.hitch(this, this.onHover, i));
            li.textContent = labels[i];
            this._optionsNode.appendChild(li);
        }
        
        // register for model notifications
        this.subscribe(spaceship.menu.SELECT_ITEM_TOPIC, 'onSelect');
        this.subscribe(spaceship.menu.END_MENU_TOPIC, 'onEndMenu');
        this.subscribe('/uow/key/press', 'onKeyPress');
    },
    
    /**
     * Called after widget cleanup. Unsubscribes from all topics. Removes
     * the widget from the parent container.
     */
    uninitialize: function() {
        this.unsubscribeAll();
        var parent = this.getParent();
        parent.removeChild(this);
    },
    
    /**
     * Called when the menu is ending. Destroys this widget.
     *
     * @subscribe END_MENU_TOPIC
     */
    onEndMenu: function() {
        this.destroyRecursive();
    },
    
    /**
     * Called when the container resizes. Recomputes the size of the menu box.
     *
     * @param size Box object
     */
    resize: function(size) {
        dojo.marginBox(this.domNode, size);
    },
    
    /**
     * Called when the menu panel hides.
     */
    onHide: function() {
        this.model.pause();
    },
    
    /**
     * Called when the menu panel shows. Gives keyboard focus to the box.
     */
    onShow: function() {
        dijit.focus(this._panelNode);
        this.model.resume();
    },
    
    /**
     * Called when the user selects a new item in the menu.
     *
     * @subscribe SELECT_ITEM_TOPIC
     */
    onSelect: function(index) {
        var items = dojo.query('.ssMenuViewLabel', this._optionsNode);
        items.removeClass('ssMenuViewLabelSelected');
        var target = items[index];
        dojo.addClass(target, 'ssMenuViewLabelSelected');
    },
    
    /**
     * Called when the user presses a key to navigate the menu or end the menu.
     *
     * @param event Dojo event
     */
    onKeyPress: function(event) {
        if(this.model.isPaused()) { return; }
        var code = event.charCode || event.keyCode;
        switch(code) {
        case dojo.keys.UP_ARROW:
        case dojo.keys.LEFT_ARROW:
            this.model.selectPrevious();
            break;
        case dojo.keys.DOWN_ARROW:
        case dojo.keys.RIGHT_ARROW:
            this.model.selectNext();
            break;
        case dojo.keys.SPACE:
        case dojo.keys.ENTER:
            this.model.chooseCurrent();
            break;
        case dojo.keys.ESCAPE:
            if(!event.shiftKey) {
                this.model.cancel();
            }
            break;
        }
    },
    
    /**
     * Called when the user hovers the mouse pointer over a menu item.
     *
     * @param index Integer index of the item
     * @param event Dojo event
     */
    onHover: function(index, event) {
        if(!this.prefs.mouseEnabled.value) return;
        this.model.selectIndex(index);
    },

    /**
     * Called when the user clicks a menu item.
     *
     * @param index Integer index of the item
     * @param event Dojo event
     */ 
    onClick: function(index, event) {
        if(!this.prefs.mouseEnabled.value) return;
        this.model.selectIndex(index);
        this.model.chooseCurrent();
    }
});