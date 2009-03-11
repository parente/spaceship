/**
 * List view/controller for a Spaceship! game menu model.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
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
    prefs: spaceship.game.UserPreferences,
    // path to template file
    templatePath: dojo.moduleUrl('spaceship', 'templates/MenuView.html'),
    postMixInProperties: function() {
        this._title = this.model.getTitle();
    },
    
    postCreate: function() {
        // hide title if no text
        if(!this._title) {
            this._titleNode.style.display = 'none';
        }
        
        // add labels to the DOM
        var labels = this.model.getLabels();
        for(var i=0; i < labels.length; i++) {
            var li = dojo.doc.createElement('li');
            dojo.addClass(li, 'ssMenuViewOption');
            if(i == this.model.getSelectedIndex()) {
                // select the current item
                dojo.addClass(li, 'ssMenuViewOptionSelected');
            }
            this.connect(li, 'onclick', dojo.hitch(this, this.onClick, i));
            this.connect(li, 'onmouseover', dojo.hitch(this, this.onHover, i));
            li.textContent = labels[i];
            this._optionsNode.appendChild(li);
        }
        
        // register for model notifications
        this.subscribe(spaceship.menu.SELECT_ITEM_TOPIC, 'onSelect');
        this.subscribe(spaceship.menu.END_MENU_TOPIC, 'onEndMenu');
    },
    
    uninitialize: function() {
        this.unsubscribeAll();
        var parent = this.getParent();
        parent.removeChild(this);
    },
    
    onEndMenu: function() {
        this.destroyRecursive();
    },
    
    onShow: function() {
        dijit.focus(this._panelNode);
    },
    
    onSelect: function(index) {
        var items = dojo.query('li', this._optionsNode);
        items.removeClass('ssMenuViewOptionSelected');
        var target = items[index];
        dojo.addClass(target, 'ssMenuViewOptionSelected');
    },

    resize: function(size) {
        dojo.marginBox(this.domNode, size);
    },
    
    onKeyPress: function(event) {
        switch(event.keyCode) {
        case dojo.keys.UP_ARROW:
        case dojo.keys.LEFT_ARROW:
            this.model.selectPrevious();
            break;
        case dojo.keys.DOWN_ARROW:
        case dojo.keys.RIGHT_ARROW:
            this.model.selectNext();
            break;
        case dojo.keys.ENTER:
            this.model.chooseCurrent();
            break;
        case dojo.keys.ESCAPE:
            this.model.cancel();
            break;
        }
    },
    
    onHover: function(index, event) {
        if(!this.prefs.mouse) return;
        this.model.selectIndex(index);
    },
        
    onClick: function(index, event) {
        if(!this.prefs.mouse) return;
        this.model.selectIndex(index);
        this.model.chooseCurrent();
    }
});