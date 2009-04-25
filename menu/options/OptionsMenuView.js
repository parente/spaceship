/**
 * Options view/controller for a Spaceship! options menu model.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.menu.options.OptionsMenuView');
dojo.require('spaceship.menu.MenuView');
dojo.require('spaceship.preferences.PreferencesTopics');
dojo.require('spaceship.images.GraphicsManager');

// @todo: factor out menu controller
dojo.declare('spaceship.menu.options.OptionsMenuView', spaceship.menu.MenuView, {
    // path to template file
    templatePath: dojo.moduleUrl('spaceship', 'templates/OptionsMenuView.html'),
    /**
     * Called after widget creation. Builds the visual menu items. Subscribes
     * to menu and preference topics.
     */
    postCreate: function() {
        // hide title if no text
        if(!this._title) {
            this._titleNode.style.display = 'none';
        }
        
        // add labels and current values to the DOM
        var objs = this.model.getItemObjects();
        for(var i=0; i < objs.length; i++) {
            var tr = dojo.doc.createElement('tr');
            // option label
            var td = dojo.doc.createElement('td');
            dojo.addClass(td, 'ssMenuViewLabel');
            if(i == this.model.getSelectedIndex()) {
                // select the current item
                dojo.addClass(td, 'ssMenuViewLabelSelected');
            }
            td.textContent = objs[i].getLabel();
            tr.appendChild(td);
            // left arrow eyecatcher
            td = this._buildArrow(i, -1, spaceship.images.LEFT_ARROW_IMAGE);
            tr.appendChild(td);
            // current value
            td = dojo.doc.createElement('td');
            dojo.addClass(td, 'ssMenuViewValue');
            td.textContent = objs[i].getValueLabel();
            tr.appendChild(td);
            // right arrow eyecatcher
            td = this._buildArrow(i, 1, spaceship.images.RIGHT_ARROW_IMAGE);
            tr.appendChild(td);
            this.connect(tr, 'onmouseover', dojo.hitch(this, this.onHover, i));
            this._optionsNode.appendChild(tr);
        }

        // register for model notifications
        this.subscribe(spaceship.preferences.UPDATE_PREFERENCE_TOPIC, 'onUpdatePref');
        this.subscribe(spaceship.menu.SELECT_ITEM_TOPIC, 'onSelect');
        this.subscribe(spaceship.menu.END_MENU_TOPIC, 'onEndMenu');
    },
    
    /**
     * Builds an arrow button for mouse dec/increment of values.
     *
     * @param index Integer index of the item
     * @param delta -1 or 1 to dec/increment
     * @param icon URL of the arrow icon
     */
    _buildArrow: function(i, delta, icon) {
        var td = dojo.doc.createElement('td');
        dojo.addClass(td, 'ssMenuViewArrow');
        var img = dojo.doc.createElement('img');
        img.src = icon;
        td.appendChild(img);
        this.connect(td, 'onclick', dojo.hitch(this, this.onClick, i, delta));
        return td;
    },
    
    /**
     * Called when the user presses a key to navigate the menu or end the menu.
     *
     * @param event Dojo event
     */
    onKeyPress: function(event) {
        switch(event.keyCode) {
        case dojo.keys.UP_ARROW:
            this.model.selectPrevious();
            break;
        case dojo.keys.LEFT_ARROW:
            this.model.deltaSelectedValue(-1);
            break;
        case dojo.keys.DOWN_ARROW:
            this.model.selectNext();
            break;        
        case dojo.keys.RIGHT_ARROW:
            this.model.deltaSelectedValue(1);
            break;
        case dojo.keys.ESCAPE:
            this.model.cancel();
            break;
        }
    },
    
    /**
     * Called when the user clicks left or right arrow to adjust a value.
     *
     * @param index Integer index of the item
     * @param delta -1 or 1 to dec/increment
     * @param event Dojo event
     */ 
    onClick: function(index, delta, event) {
        if(!this.prefs.mouseControl.value) return;
        this.model.selectIndex(index);
        this.model.deltaSelectedValue(delta);
    },
    
    /**
     * Called when preferences change. Reflects the change in the view.
     */
    onUpdatePref: function(key) {
        var obj = this.model.getItemById(key);
        var index = this.model.getIndexById(key)*4 + 2;
        var node = dojo.query('td', this._optionsNode)[index];
        node.textContent = obj.getValueLabel();
    }
});