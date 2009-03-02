/**
 * Game model code for the main Spaceship! game.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.GameModel');
dojo.require('dijit._Widget');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.game.Tile');
dojo.require('spaceship.minigame.Outcome');
dojo.require('spaceship.utils.Barrier');

dojo.declare('spaceship.game.GameModel', dijit._Widget, {
    // bundle of locale strings
    labels: null,
    // bundle of game config
    config: null,
    postMixInProperties: function() {
        // number of shots left
        this._ammo = this.config.initialAmmo;
        // number of hits player can take before player loses
        this._shields = this.config.initialShields;
        // number of ships left to destroy before player wins
        this._ships = this.config.initialShips;
        // array of game tiles
        this._tiles = [];
        // targeted tile index
        this._targetIndex = 0;
        // current state of the async event loop
        this._state = null;
        // outcome for the next minigame
        this._minigameOutcome = null;
    },
    
    /**
     * Notify all listeners that the game is ending as a loss.
     */
    uninitialize: function() {
        console.debug('cleaning up game model');
        dojo.publish(spaceship.game.END_GAME_TOPIC);
    },
    
    /**
     * Creates the initial ship tiles.
     *
     * @param total Total number of tiles
     */
    _createShipTiles: function(total) {
        // bound the number of ships
        this._ships = Math.min(this._ships, total);
        // place all the enemy ship tiles
        var count = 0;
        var args = {config : this.config, labels: this.labels};
        while(count < this._ships) {
            // pick a random location in the grid
            var i = Math.floor(Math.random() * total);
            if(this._tiles[i] == undefined) {
                // build a ship tile
                args.index = i;
                this._tiles[i] = new spaceship.game.ShipTile(args);
                ++count;
            }
        }        
    },
    
    /**
     * Creates the initial reward, hazard, and empty tiles.
     *
     * @param total Total number of tiles
     */
    _createOtherTiles: function(total) {
        // place all bonus, hazard, and empty tiles
        var args = {config : this.config, labels: this.labels};
        for(var i=0; i < total; i++) {
            if(this._tiles[i] == undefined) {
                var x, arr;
                // decide what category tile
                x = Math.random();
                for(var j=0; j < this.config.tiles.length; j++) {
                    var obj = this.config.tiles[j];
                    if(x < obj.cumProb) {
                        arr = spaceship.game[obj.category];
                        break;
                    }
                }
                // decide what class of tile
                x = Math.random();
                for(var j=0; j < arr.length; j++) {
                    var obj = arr[j];
                    if(x < obj.cumProb) {
                        args.index = i;
                        this._tiles[i] = new obj.klass(args);
                        break;
                    }
                }
            }
        }
    },
    
    /**
     * Creates all game tiles in the grid.
     */
    createGridTiles: function() {
        var total = this.config.rows * this.config.columns;
        this._createShipTiles(total);
        this._createOtherTiles(total);
    },

    /**
     * Starts the async game loop running.
     */
    run: function() {
        // initialize the tiles
        this.createGridTiles();
        // publish start game topic to allow other components to initialize
        dojo.publish(spaceship.game.START_GAME_TOPIC);
        // iterate the loop immediately
        this.iterate();
    },
    
    /**
     * Chooses a random reward or hazard based on difficulty.
     */
    _chooseRandomOutcome: function() {
        var x, arr;
        var args = {config : this.config, labels: this.labels};
        // decide what category outcome
        x = Math.random();
        for(var j=0; j < this.config.minigames.length; j++) {
            var obj = this.config.minigames[j];
            if(x < obj.cumProb) {
                arr = spaceship.minigame[obj.category];
                break;
            }
        }
        // decide what class of outcome
        x = Math.random();
        for(var j=0; j < arr.length; j++) {
            var obj = arr[j];
            if(x < obj.cumProb) {
                args.index = i;
                return new obj.klass(args);
            }
        }
    },
    
    /**
     * Publishes the next game topic for views and controllers to hande.
     */
    iterate: function() {
        // @todo: handle win and lose events
        var bar = new spaceship.utils.Barrier();
        bar.addCallback(this, 'iterate');
        var args;
        if(this._state != spaceship.game.SHOW_STATUS_TOPIC) {
            var topic, value;
            // just performed an action, report status
            if(this._ammo > 0) {
                // next event will be shot to fire
                topic = spaceship.game.PREPARE_SHOT_TOPIC;
                value = this._ammo;
            } else {
                // next event will be minigame
                topic = spaceship.game.PLAY_MINIGAME_TOPIC;
                // choose the reward / hazard of the upcoming minigame
                this._minigameOutcome = this._chooseRandomOutcome();
                value = this._minigameOutcome;
            }
            // store the current state
            this._state = spaceship.game.SHOW_STATUS_TOPIC;
            args = [bar, topic, value];
        } else {
            // just showed status, proceed with next action
            args = [bar];
            if(this._ammo > 0) {
                // fire a shot
                this._state = spaceship.game.PREPARE_SHOT_TOPIC;
                // reduce the count immediately
                this.changeAmmo(-1);
            } else {
                // start a minigame
                this._state = spaceship.game.PLAY_MINIGAME_TOPIC;
            }
        }
        // publish the topic
        dojo.publish(this._state, args);
    },
    
    /**
     * Sends a PAUSE_GAME_TOPIC with the resume topic to fire.
     */
    pause: function() {
        dojo.publish(spaceship.game.PAUSE_GAME_TOPIC, 
            [spaceship.game.RESUME_GAME_TOPIC]);
    },
    
    getState: function() {
        return this._state;
    },
    
    targetTile: function(index) {
        if(index == this._targetIndex) return false;
        dojo.publish(spaceship.game.UNTARGET_TILE_TOPIC, [this._targetIndex]);
        this._targetIndex = index;
        dojo.publish(spaceship.game.TARGET_TILE_TOPIC, [index]);
        return true;
    },
    
    getTargetedTile: function() {
        return this._targetIndex;
    },
    
    shootTarget: function() {
        return this._tiles[this._targetIndex].shoot(this);
    },
    
    changeAmmo: function(count) {
        if(this._ammo + count < 0) {
            // don't go negative
            count = -this._ammo;
        }
        this._ammo += count;
        dojo.publish(spaceship.game.CHANGE_AMMO_TOPIC, [count, this._ammo]);
    },
    
    getAmmo: function(count) {
        return this._ammo;
    },
    
    changeShields: function(count) {
        if(this._shields + count < 0) {
            // don't go negative
            count = -this._shields;
        }
        this._shields += count;
        dojo.publish(spaceship.game.CHANGE_SHIELDS_TOPIC, 
            [count, this._shields]);
    },

    getShields: function() {
        return this._shields;
    },
    
    hitShip: function() {
        --this._ships;
        dojo.publish(spaceship.game.HIT_SHIP_TOPIC, [this._ships]);
    },
    
    missShip: function() {
        dojo.publish(spaceship.game.MISS_SHIP_TOPIC);
    },
    
    getShips: function() {
        return this._ships;
    },
    
    detectShip: function() {
        // collect all ship tiles
        var tiles = dojo.filter(this._tiles, function(tile) {
            return tile.isShip();
        });
        // pick a random tile to expose
        var index = Math.floor(Math.random() * tiles.length);
        // notify with the index of the ship tile
        dojo.publish(spaceship.game.HINT_TOPIC, [tiles[index].index]);
    },
    
    warpTime: function(count) {
        var arr = [];
        var args = {config : this.config, labels: this.labels};
        // choose random tiles
        for(var i=0; i < count; i++) {
            var index = Math.floor(Math.random() * this._tiles.length);
            var tile = this._tiles[index];
            if(tile.isRevealed() || !tile.isShip()) {
                // replace tile with a hidden ship tile if it is not already
                // a hidden ship tile
                args.index = index;
                this._tiles[index] = new spaceship.game.ShipTile(args);
                arr.push(index);
                ++this._ships;
            }
        }
        // notify with the indices of the new tiles
        dojo.publish(spaceship.game.WARP_TOPIC, [arr, this._ships]);
    }
});
