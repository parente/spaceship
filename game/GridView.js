/**
 * Game grid code for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.GridView');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Container');
dojo.require('dojo.string');
dojo.require('dojo.fx');
dojo.require('spaceship.preferences.PreferencesModel');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.images.GraphicsManager');

// @todo: factor out grid controllers
dojo.declare('spaceship.game.GridView', [dijit._Widget, 
                                         dijit._Templated,
                                         dijit._Contained,
                                         spaceship.utils.Subscriber], {
    // bundle of locale strings
    labels: null,
    // bundle of game config
    config: null,
    // game model
    model: null,
    // user preferences
    prefs: spaceship.preferences.PreferencesModel,
    // template for grid which is built dynamically for the most part
    templatePath: dojo.moduleUrl('spaceship', 'templates/GridView.html'),
    
    /**
     * Called after widget construction.
     */
    postMixInProperties: function() {
        // flag set when user cannot give commands to the grid
        this._frozen = true;
        // barrier to notify when report of the shot is complete
        this._barrier = null;
    },
    
    /**
     * Called after widget creation. Subscribes to game topics.
     */
    postCreate: function() {
        this.subscribe(spaceship.game.START_GAME_TOPIC, 'onStartGame');
        this.subscribe(spaceship.game.PAUSE_GAME_TOPIC, 'onPauseGame');
        this.subscribe(spaceship.game.RESUME_GAME_TOPIC, 'onResumeGame');
        this.subscribe(spaceship.game.UNTARGET_TILE_TOPIC, 'onUntargetTile');
        this.subscribe(spaceship.game.TARGET_TILE_TOPIC, 'onTargetTile');
        this.subscribe(spaceship.game.LAND_SHOT_TOPIC, 'onHitTile');
        this.subscribe(spaceship.game.PREPARE_SHOT_TOPIC, 'onPrepareShot');
        this.subscribe(spaceship.game.WARP_TOPIC, 'onTimeWarp');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
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
     * Called when the container resizes. Recomputes the size of the game grid
     * and all tile cells.
     *
     * @param size Box object
     */
    resize: function(size) {
        // size the grid box
        dojo.marginBox(this.domNode, size);
        // bound cells by width
        var cs = size.w / (this.config.columns+1);
        if(cs * (this.config.rows+1) > size.h) {
            // bound by height
            cs = size.h / (this.config.rows+1);
        }
        
        // resize all the cells
        var box = {w: cs, h: cs};
        dojo.query('td', this._tableNode).forEach(function(td) {
            dojo.marginBox(td, box);
        });

        // center the table
        var ts = dojo.marginBox(this._tableNode);
        box = {
            top: (size.h - ts.h) / 2 + 'px',
            left: (size.w - ts.w) / 2 + 'px'
        };
        dojo.style(this._tableNode, box);
    },

    /**
     * Creates the DOM nodes for the table body, table rows, table headers,
     * and table cells that will contain game tile icons.
     */
    onStartGame: function() {
        var tileIndex = 0;
        var tbody = dojo.query('tbody', this._tableNode)[0];
        for(var row = 0; row < this.config.rows+1; row++) {
            var tr = dojo.doc.createElement('tr');
            dojo.addClass(tr, 'ssGridViewRow');
            for(var col = 0; col < this.config.columns+1; col++) {
                if(col > 0 && row == 0) {
                    // column header
                    var td = dojo.doc.createElement('th');                    
                    td.textContent = col;
                    dojo.addClass(td, 'ssGridViewColumnHeader');
                } else if(row > 0 && col == 0) {
                    // row header
                    var td = dojo.doc.createElement('th');
                    td.textContent = row;
                    dojo.addClass(td, 'ssGridViewRowHeader');
                } else if(row == 0) {
                    // row header
                    var td = dojo.doc.createElement('th');
                    dojo.addClass(td, 'ssGridViewRowHeader');                    
                } else {
                    // game cell representing a tile
                    var td = dojo.doc.createElement('td');
                    // game cell status icon, always starts hidden
                    var img = dojo.doc.createElement('img');
                    img.src = spaceship.images.HIDDEN_TILE_IMAGE;
                    img.alt = this.labels.HIDDEN_TILE;
                    dojo.addClass(img, 'ssGridViewCellIcon');
                    td.appendChild(img);
                    dojo.addClass(td, 'ssGridViewCell');
                    if(this.model.getTargetedTile() == tileIndex) {
                        dojo.addClass(td, 'ssGridViewCellSelected'); 
                    }
                    // register for events on the cell
                    this.connect(td, 'onclick', 
                        dojo.hitch(this, this.onClick, tileIndex));
                    this.connect(td, 'onmouseover', 
                        dojo.hitch(this, this.onHover, tileIndex));
                    ++tileIndex;
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    },
    
    /**
     * Called when the game pauses. Prevents input.
     *
     * @subscribe PAUSE_GAME_TOPIC
     */
    onPauseGame: function() {
        this._frozen = true;
    },
    
    /**
     * Called when the game resumes. Enables input if preparing a shot.
     *
     * @subscribe RESUME_GAME_TOPIC
     */
    onResumeGame: function() {
        console.debug('onResumeGame', this.id);
        if(this.model.getState() == spaceship.game.PREPARE_SHOT_TOPIC) {
            this._frozen = false;
        }
    },
    
    /**
     * Called when the game is ending. Destroys this widget.
     *
     * @subscribe END_GAME_TOPIC
     */
    onEndGame: function() {
        this.destroyRecursive();
    },
    
    /**
     * Called when the user starts targeting a shot.
     *
     * @subscribe PREPARE_SHOT_TOPIC
     */
    onPrepareShot: function(bar) {
        console.debug('GameGrid:onPrepareShot');
        // allow user control
        this._frozen = false;
        // add this as responder to barrier and store it
        bar.addResponder(this.id);
        this._barrier = bar;
        // show the grid pane in its container
        var parent = this.getParent();
        parent.selectChild(this);
    },
    
    /**
     * Called when the user targets a new tile.
     *
     * @subscribe TARGET_TILE_TOPIC
     */
    onTargetTile: function(index) {
        var cell = dojo.query('td', this._tableNode)[index];
        dojo.addClass(cell, 'ssGridViewCellSelected');        
    },
    
    /**
     * Called when the user stops targeting a tile.
     *
     * @subscribe UNTARGET_TILE_TOPIC
     */
    onUntargetTile: function(index) {
        var cell = dojo.query('td', this._tableNode)[index];
        dojo.removeClass(cell, 'ssGridViewCellSelected');
    },
    
    /**
     * Called when the user shoots a tile
     *
     * @subscribe LAND_SHOT_TOPIC
     */
    onHitTile: function(tile) {
        var td = dojo.query('td', this._tableNode)[tile.index];
        var icon = dojo.query('img', td)[0];
        var url = tile.getImageUrl();
        // get the tile animation
        var anim = this._animateTileHit(td, icon);
        // show the new icon
        icon.src = url;
        icon.alt = tile.getLabel();
        // start the animation
        anim.play();
    },

    /**
     * Called when enemy reinforcements warp-in.
     *
     * @param topic String topic name
     * @param indices Array of tile indices that now contain ships
     * @param remain Number of remaining ships
     * @subscribe WARP_TOPIC
     */
    onTimeWarp: function(topic, indices, remain) {
        var icons = dojo.query('img', this._tableNode);
        var text = this.labels.HIDDEN_TILE;
        var url = spaceship.images.HIDDEN_TILE_IMAGE;
        dojo.forEach(indices, function(index) {
            var icon = icons[index];
            icon.src = url;
            icon.alt = text;
        });
    },
    
    /**
     * Called when the game grid panel shows. Gives keyboard focus to the 
     * table.
     */
    onShow: function() {
        console.debug('GameGrid:onShow');
        // give the table focus
        dijit.focus(this._panelNode);
    },
   
    /**
     * Called when the user presses a key. Moves the tile selection, reveals
     * a hidden tile, or pauses the game.
     *
     * @param event Event object
     */
    onKeyPress: function(event) {
        if(this._frozen) return;
        // get the linear index
        var index = this.model.getTargetedTile();
        // compute the row and column in the grid
        var col = index % this.config.columns;
        var row = Math.floor(index / this.config.columns);
        // get the appropriate code for the key
        var code = event.charCode || event.keyCode;
        switch(code) {
        case dojo.keys.UP_ARROW:
            if(row > 0) --row;
            break;
        case dojo.keys.LEFT_ARROW:
            if(col > 0) --col;
            break;
        case dojo.keys.DOWN_ARROW:
            if(row < this.config.rows - 1) ++row;
            break;
        case dojo.keys.RIGHT_ARROW:
            if(col < this.config.columns - 1) ++col;
            break;
        case dojo.keys.SPACE:
        case dojo.keys.ENTER:
            // reveal the selected tile
            if(this.model.shootTarget()) {
                // freeze to prevent duplicate shots
                this._frozen = true;
            }
            return;
        case dojo.keys.ESCAPE:
            // pause the game
            this.model.pause();
            break;
        }
        // target the new tile
        var newIndex = row*this.config.columns + col;    
        this.model.targetTile(newIndex);
    },
    
    /**
     * Called when the mouse pointer hovers over a grid cell. Selects the tile.
     *
     * @param index Integer cell index
     * @param event Event object
     */
    onHover: function(index, event) {
        if(!this.prefs.mouseControl.value || 
           event.target == event.currentTarget) {
            return;
        }
        if(this._frozen) return;
        this.model.targetTile(index);
    },

    /**
     * Called when the mouse pointer clicks over a grid cell. Reveals the tile.
     *
     * @param index Integer cell index
     * @param event Event object
     */        
    onClick: function(index, event) {
        if(this._frozen || !this.prefs.mouseControl.value) return;
        // make sure the tile is selected
        this.model.targetTile(index);
        // now reveal the tile
        if(this.model.shootTarget()) {
            // freeze to prevent multiple shots
            this._frozen = true;
        }
    },
    
    /**
     * Fades in a revealed tile from white to transparent.
     *
     * @param td Table cell node representing the tile
     * @param icon String icon URL representing what lies under the tile
     */
    _animateTileHit: function(td, icon) {
        // start the icon hidden
        dojo.style(icon, 'opacity', '0.0');
        // fade in icon
        var appear = dojo.fadeIn({
            node: icon, 
            duration: 500
        });
        // flash cell background
        var flash = dojo.animateProperty({
            node: td,
            duration: 500,
            properties: {
                backgroundColor: {start: '#ffffff', end: '#000000'}
            }
        });
        // combine the two animations
        var anim = dojo.fx.combine([flash, appear]);
        // disconnect, go transparent, and notify when done
        var tok = dojo.connect(anim, 'onEnd', dojo.hitch(this, function() {
            dojo.disconnect(tok);
            dojo.style(td, 'backgroundColor', 'transparent');
            this._barrier.notify(this.id);
        }));
        return anim;
    }
});

// add icon support to tiles
(function() {
    var map = {
        'spaceship.game.ShipTile' : spaceship.images.SHIP_TILE_IMAGE,
        'spaceship.game.EmptyTile' : spaceship.images.EMPTY_TILE_IMAGE,
        'spaceship.game.AmmoTile' : spaceship.images.AMMO_TILE_IMAGE,
        'spaceship.game.HintTile' : spaceship.images.HINT_TILE_IMAGE,
        'spaceship.game.ShieldTile' : spaceship.images.SHIELD_TILE_IMAGE,
        'spaceship.game.LeechTile' : spaceship.images.LEECH_TILE_IMAGE,
        'spaceship.game.BombTile' : spaceship.images.BOMB_TILE_IMAGE,
        'spaceship.game.WarpTile' : spaceship.images.WARP_TILE_IMAGE
    };
    dojo.extend(spaceship.game.Tile, {
        getImageUrl: function() {
            return dojo.moduleUrl('spaceship', map[this.declaredClass]);
        }
    });
})();