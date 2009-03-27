/**
 * Game model code for the main Spaceship! game. Drives the main game loop.
 * Maintains ship, shield, and ammo counts.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
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
    /**
     * Called after widget construction.
     */
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
        // number of minigames left to play in this series
        this._minigameSeries = 0;
        // true when game will end on next iteration
        this._gaveOver = false;
    },
    
    /**
     * Called after widget cleanup. Notifies all listeners that the game is
     * ending.
     *
     * @publish END_GAME_TOPIC
     */
    uninitialize: function() {
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
    _createGridTiles: function() {
        var total = this.config.rows * this.config.columns;
        this._createShipTiles(total);
        this._createOtherTiles(total);
    },

    /**
     * Starts the async game loop running.
     *
     * @publish START_GAME_TOPIC
     */
    run: function() {
        // initialize the tiles
        this._createGridTiles();
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
                return new obj.klass(args);
            }
        }
    },
    
    /**
     * Publishes the next game topic.
     *
     * @publish START_MINIGAME_SERIES_TOPIC
     * @publish END_MINIGAME_SERIES_TOPIC
     * @publish WIN_GAME_TOPIC
     * @publish LOSE_GAME_TOPIC
     * @publish PREPARE_SHOT_TOPIC spaceship.utils.Barrier
     * @publish SHOW_STATUS_TOPIC spaceship.utils.Barrier, String, Object
     * @publish PLAY_MINIGAME_TOPIC spaceship.utils.Barrier, spaceship.minigame.Outcome
     */
    iterate: function() {
        var bar = new spaceship.utils.Barrier();
        bar.addCallback(this, 'iterate');
        var args;
        
        if(this._gameOver) {
            // shut everything down
            this.destroyRecursive();
        } else if(this._state != spaceship.game.SHOW_STATUS_TOPIC) {
            var topic, value;
            // just performed an action, report status
            if(this._shields == 0 || this._ships == 0) {
                // next event will be end of game message
                topic = spaceship.game.END_GAME_TOPIC;
                value = null;
            } else if(this._ammo > 0 && this._minigameSeries == 0) {
                // next event will be shot to fire
                topic = spaceship.game.PREPARE_SHOT_TOPIC;
                value = this._ammo;
                if(this._minigameOutcome) {
                    // ending a minigame series
                    dojo.publish(spaceship.game.END_MINIGAME_SERIES_TOPIC);
                    this._minigameOutcome = null;
                }
            } else {
                // next event will be minigame
                topic = spaceship.game.PLAY_MINIGAME_TOPIC;
                value = this._chooseRandomOutcome();
                // store reward/hazard
                this._minigameOutcome = value;
                if(this._minigameSeries == 0) {
                    // starting a new series
                    dojo.publish(spaceship.game.START_MINIGAME_SERIES_TOPIC);
                    this._minigameSeries = this.config.requiredMinigames;
                }
            }
            // store the current state
            console.debug('showing status');
            this._state = spaceship.game.SHOW_STATUS_TOPIC;
            args = [bar, topic, value];
        } else {
            // just showed status, proceed with next action
            if(this._shields == 0) {
                // game over, user lost
                this._gameOver = true;
                var topic = spaceship.game.LOSE_GAME_TOPIC;
                dojo.publish(topic);
                args = [bar, topic, null];
                console.debug('lost game');
            } else if(this._ships == 0) {
                // game over, user won
                this._gameOver = true;
                var topic = spaceship.game.WIN_GAME_TOPIC;
                dojo.publish(topic);
                args = [bar, topic, null];
                console.debug('won game');
            } else if(this._ammo > 0 && this._minigameSeries == 0) {
                // fire a shot
                this._state = spaceship.game.PREPARE_SHOT_TOPIC;
                // reduce the count immediately
                this.changeAmmo(-1);
                args = [bar];
                console.debug('taking shot');
            } else {
                // start a minigame
                --this._minigameSeries;
                this._state = spaceship.game.PLAY_MINIGAME_TOPIC;
                args = [bar, this._minigameOutcome];
                console.debug('playing minigame');
            }
        }
        // publish the topic
        dojo.publish(this._state, args);
    },
    
    /**
     * Pauses the game.
     *
     * @publish PAUSE_GAME_TOPIC String
     */
    pause: function() {
        dojo.publish(spaceship.game.PAUSE_GAME_TOPIC, 
            [spaceship.game.RESUME_GAME_TOPIC]);
    },
    
    /**
     * Gets the targeted tile object.
     *
     * @return spaceship.game.Tile
     */
    getTile: function() {
        return this._tiles[this._targetIndex];
    },

    /**
     * Gets the current game state.
     *
     * @return String
     */
    getState: function() {
        return this._state;
    },
    
    /**
     * Moves the active target to a new tile. Untargets the previous tile.
     *
     * @param index Index of the tile
     * @return True if targeted a new tile, false if not
     * @publish UNTARGET_TILE_TOPIC Integer
     * @publish TARGET_TILE_TOPIC Integer
     */
    targetTile: function(index) {
        if(index == this._targetIndex) return false;
        dojo.publish(spaceship.game.UNTARGET_TILE_TOPIC, [this._targetIndex]);
        this._targetIndex = index;
        dojo.publish(spaceship.game.TARGET_TILE_TOPIC, [index]);
        return true;
    },
    
    /**
     * Gets the index of the targeted tile.
     *
     * @return Integer
     */
    getTargetedTile: function() {
        return this._targetIndex;
    },
    
    /**
     * Shoots the targeted tile.
     *
     * @return True if shot, false if already hit
     */
    shootTarget: function() {
        return this._tiles[this._targetIndex].shoot(this);
    },
    
    /**
     * Update the ammo count.
     *
     * @param count Change in ammo, positive or negative
     * @publish CHANGE_AMMO_TOPIC String, Integer, Integer
     */
    changeAmmo: function(count) {
        if(this._ammo + count < 0) {
            // don't go negative
            count = -this._ammo;
        }
        this._ammo += count;
        dojo.publish(spaceship.game.CHANGE_AMMO_TOPIC, [this._state,
            count, this._ammo]);
    },

    /**
     * Get the ammo count.
     *
     * @return Integer
     */
    getAmmo: function() {
        return this._ammo;
    },

    /**
     * Update the shield count.
     *
     * @param count Change in shields, positive or negative
     * @publish CHANGE_SHIELDS_TOPIC String, Integer, Integer
     */
    changeShields: function(count) {
        if(this._shields + count < 0) {
            // don't go negative
            count = -this._shields;
        }
        this._shields += count;
        dojo.publish(spaceship.game.CHANGE_SHIELDS_TOPIC, 
            [this._state, count, this._shields]);
    },

    /**
     * Get the shield count.
     *
     * @return Integer
     */
    getShields: function() {
        return this._shields;
    },
    
    /**
     * Destroy an enemy ship.
     *
     * @publish HIT_SHIP_TOPIC String, Integer
     */
    hitShip: function() {
        --this._ships;
        dojo.publish(spaceship.game.HIT_SHIP_TOPIC, [this._state, 
            this._ships]);
    },
    
    /**
     * Miss an enemy ship.
     *
     * @publish HIT_SHIP_TOPIC String, Integer
     */
    missShip: function() {
        dojo.publish(spaceship.game.MISS_SHIP_TOPIC, [this._state,
            this._ships]);
    },
    
    /**
     * Get the enemy ship count.
     *
     * @return Integer
     */
    getShips: function() {
        return this._ships;
    },

    /**
     * Detect an enemy ship.
     *
     * @publish HINT_TOPIC String, Integer
     */
    detectShip: function() {
        // collect all ship tiles
        var tiles = dojo.filter(this._tiles, function(tile) {
            return tile.isShip();
        });
        // pick a random tile to expose
        var index = Math.floor(Math.random() * tiles.length);
        // notify with the index of the ship tile
        dojo.publish(spaceship.game.HINT_TOPIC, [this._state, 
            tiles[index].index]);
    },

    /**
     * Add enemy reinforcements.
     *
     * @publish WARP_TOPIC String, Array of integers, Integer
     */    
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
        dojo.publish(spaceship.game.WARP_TOPIC, [this._state, arr, 
            this._ships]);
    }
});
