/**
 * Options view/controller for a Spaceship! options menu model.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.menu.options.OptionsMenuView');
dojo.require('spaceship.menu.MenuView');
dojo.require('spaceship.preferences.PreferencesTopics');

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
            var td = dojo.doc.createElement('td');
            dojo.addClass(td, 'ssMenuViewLabel');
            if(i == this.model.getSelectedIndex()) {
                // select the current item
                dojo.addClass(td, 'ssMenuViewLabelSelected');
            }
            this.connect(td, 'onclick', dojo.hitch(this, this.onClick, i));
            this.connect(td, 'onmouseover', dojo.hitch(this, this.onHover, i));
            td.textContent = objs[i].getLabel();
            tr.appendChild(td);
            this._optionsNode.appendChild(tr);
        }

        // register for model notifications
        this.subscribe(spaceship.preferences.UPDATE_PREFERENCE_TOPIC, 'onUpdatePref');
        this.subscribe(spaceship.menu.SELECT_ITEM_TOPIC, 'onSelect');
        this.subscribe(spaceship.menu.END_MENU_TOPIC, 'onEndMenu');
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
        case dojo.keys.ENTER:
        case dojo.keys.ESCAPE:
            this.model.cancel();
            break;
        }
    },
    
    onUpdatePref: function(key) {
        console.debug(key);
    }
});