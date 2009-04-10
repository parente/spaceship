/**
 * Status event model for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.StatusModel');
dojo.require('dijit._Widget');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.utils.Subscriber');

dojo.declare('spaceship.game.StatusModel', [dijit._Widget,
                                            spaceship.utils.Subscriber], {
    // bundle of locale strings
    labels: null,
    // bundle of game config
    config: null,
    /**
     * Called after widget construction.
     */
    postMixInProperties: function() {
        // result of the last action
        this._lastResult = null;
    },
    
    /**
     * Called after widget creation. Subscribes to game topics.
     */
    postCreate: function() {
        // listen for tile messages
        this.subscribe(spaceship.game.HIT_SHIP_TOPIC, 'onHitShip');
        this.subscribe(spaceship.game.CHANGE_SHIELDS_TOPIC, 'onChangeShields');
        this.subscribe(spaceship.game.CHANGE_AMMO_TOPIC, 'onChangeAmmo');
        this.subscribe(spaceship.game.MISS_SHIP_TOPIC, 'onMissShip');
        this.subscribe(spaceship.game.HINT_TOPIC, 'onGetHint');
        this.subscribe(spaceship.game.WARP_TOPIC, 'onTimeWarp');
        // listen for minigame outcomes
        this.subscribe(spaceship.game.END_MINIGAME_TOPIC, 'onEndMinigame');
        // listen for when to reset collected status
        this.subscribe(spaceship.game.PREPARE_SHOT_TOPIC, 'onResetStatus');
        this.subscribe(spaceship.game.PLAY_MINIGAME_TOPIC, 'onResetStatus');
        // listen for when to cleanup
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
    },
    
    /**
     * Called after widget cleanup. Unsubscribes from all topics.
     */
    uninitialize: function() {
        this.unsubscribeAll();
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
     * Gets a localized message about an upcoming shot including a report of
     * the outcome of the previous game state.
     *
     * @param ammo Number of shots remaining
     * @return Array[3] of previous outcome, previous outcome details, and next 
     *   action strings
     */
    getShotMessage: function(ammo) {
        var msgs = this.getLastResultMessage();
        if(this._lastResult == null || 
            this._lastResult.topic == spaceship.game.CHANGE_AMMO_TOPIC ||
            this._lastResult.topic == spaceship.game.END_MINIGAME_TOPIC) {
            msgs.push(this.labels.SHOT_MESSAGE);
        } else {
            var template = (ammo == 1) ? 
                this.labels.AMMO_REMAIN_MESSAGE : this.labels.AMMOS_REMAIN_MESSAGE;
            msgs.push(dojo.string.substitute(template, {ammo : ammo}));
        }
        return msgs;
    },

    /**
     * Gets a localized message about an upcoming minigame including a report
     * of the outcome of the previous game state.
     *
     * @param outcome Minigame outcome object for the next minigame
     * @return Array[3] of previous outcome, previous outcome details, and next 
     *   action strings
     */    
    getMinigameMessage: function(outcome) {
        var msgs = this.getLastResultMessage();
        var template = this.labels.MINIGAME_MESSAGE;
        msgs.push(dojo.string.substitute(template, {challenge : outcome.getLabel()}));
        return msgs;
    },
    
    /**
     * Gets a localized message about the outcome of the previous game state. 
     * For use just before the game is about to end.
     * 
     * @return Array[3] of previous outcome and two empty strings
     */
    getLastActionMessage: function() {
        var msgs = this.getLastResultMessage();
        // no remaining items or next action to report
        msgs[1] = '';
        msgs[2] = '';
        return msgs;
    },
    
    /**
     * Gets a localized message stating the user won the game.
     *
     * @return Array[3] of congratulation text
     */
    getWinMessage: function(topic) {
        return this.labels.WIN_GAME_MESSAGES;
    },

    /**
     * Gets a localized message stating the user lost the game.
     *
     * @return Array[3] of try again text
     */    
    getLoseMessage: function(topic) {
        return this.labels.LOSE_GAME_MESSAGES;
    },

    /**
     * Gets a localized message describing the outcome of the previous game 
     * state.
     *
     * @return Array[2] of previous outcome and previous outcome detail strings
     */
    getLastResultMessage: function() {
        var msgs = [];
        if(this._lastResult == null) {
            msgs[0] = this.labels.INTRO_MESSAGE;
            var ships = this.config.initialShips;
            var template = (ships == 1) ? 
                this.labels.GOAL_MESSAGE : this.labels.GOALS_MESSAGE;
            msgs[1] = dojo.string.substitute(template, {enemies : ships});
            return msgs;
        } else {
            // use the messages squirreled away in the last result
            return this._lastResult.msgs.slice();
        }
    },
    
    /**
     * Gets the raw information about the last result.
     *
     * @return Object with at least topic and msgs properties
     */
    getLastResult: function() {
        return this._lastResult;
    },
    
    /**
     * Called when the user hits a ship tile.
     *
     * @subscribe HIT_SHIP_TOPIC
     */
    onHitShip: function(state, remain) {
        var msgs = [this.labels.HIT_MESSAGE];
        var template = (remain == 1) ? 
            this.labels.HIT_REMAIN_MESSAGE : this.labels.HITS_REMAIN_MESSAGE;
        msgs[1] = dojo.string.substitute(template, {enemies : remain});
        this._lastResult = {topic: spaceship.game.HIT_SHIP_TOPIC, msgs: msgs};
    },

    /**
     * Called when the user hits an empty tile.
     *
     * @subscribe MISS_SHIP_TOPIC
     */
    onMissShip: function(state, remain) {
        var msgs = [this.labels.MISS_MESSAGE, ''];
        this._lastResult = {topic: spaceship.game.MISS_SHIP_TOPIC, msgs: msgs};
    },

    /**
     * Called when the user gains or loses ammo.
     *
     * @subscribe CHANGE_AMMO_TOPIC
     */    
    onChangeAmmo: function(state, change, remain) {
        var msgs = [];
        var template;
        if(change > 0) {
            template = (change == 1) ? 
                this.labels.AMMO_MESSAGE : this.labels.AMMOS_MESSAGE;
            msgs[0] = dojo.string.substitute(template, {ammo : change});
        } else {
            change = Math.abs(change);
            template = (change == 1) ? 
                this.labels.LEECH_MESSAGE : this.labels.LEECHES_MESSAGE;
            msgs[0] = dojo.string.substitute(template, {ammo : change});            
        }
        template = (remain == 1) ? 
            this.labels.AMMO_REMAIN_MESSAGE : this.labels.AMMOS_REMAIN_MESSAGE;
        msgs[1] = dojo.string.substitute(template, {ammo : remain});
        this._lastResult = {topic: spaceship.game.CHANGE_AMMO_TOPIC, msgs: msgs};
    },
    
    /**
     * Called when the user gains or loses shields.
     *
     * @subscribe CHANGE_SHIELDS_TOPIC
     */
    onChangeShields: function(state, change, remain) {
        var msgs = [];
        var template;
        if(change > 0) {
            template = (change == 1) ? 
                this.labels.SHIELD_MESSAGE : this.labels.SHIELDS_MESSAGE;
            msgs[0] = dojo.string.substitute(template, {shields : change});
        } else {
            change = Math.abs(change);
            template = (change == 1) ? 
                this.labels.BOMB_MESSAGE : this.labels.BOMBS_MESSAGE;
            msgs[0] = dojo.string.substitute(template, {shields : change});            
        }
        template = (remain == 1) ? 
            this.labels.SHIELD_REMAIN_MESSAGE : this.labels.SHIELDS_REMAIN_MESSAGE;
        msgs[1] = dojo.string.substitute(template, {shields : remain});
        this._lastResult = {topic: spaceship.game.CHANGE_SHIELDS_TOPIC, msgs: msgs};
    },
    
    /**
     * Called when the user gets a hint.
     *
     * @subscribe HINT_TOPIC
     */
    onGetHint: function(state, index) {
        var msgs = [this.labels.HINT_MESSAGE];
        // compute row and column
        var row = Math.floor(index / this.config.columns) + 1;
        var column = (index % this.config.columns) + 1;
        // build the message
        var template = this.labels.HINT_CELL_MESSAGE;
        var args = {row : row, column: column};
        msgs[1] = dojo.string.substitute(template, args);
        this._lastResult = {topic: spaceship.game.HINT_TOPIC, msgs: msgs};        
    },
    
    /**
     * Called when enemy reinforcements arrive.
     *
     * @subscribe WARP_TOPIC
     */
    onTimeWarp: function(state, indices, remain) {
        var msgs = [this.labels.WARP_MESSAGE];
        var template = (remain == 1) ? 
            this.labels.GOAL_MESSAGE : this.labels.GOALS_MESSAGE;
        msgs[1] = dojo.string.substitute(template, {enemies : remain});
        this._lastResult = {topic: spaceship.game.WARP_TOPIC, msgs: msgs};
    },
    
    /**
     * Called when a minigame ends in a win or loss.
     *
     * @subscribe END_MINIGAME_TOPIC
     */
    onEndMinigame: function(outcome) {
        var msgs = [outcome.getResultLabel()];
        if(this._lastResult) {
            // keep the remaining items status message 
            msgs[1] = this._lastResult.msgs[1];
        } else {
            msgs[1] = '';
        }
        this._lastResult = {topic : spaceship.game.END_MINIGAME_TOPIC, 
            msgs : msgs};
    },


    /**
     * Called when the user starts preparing a shot or playing a minigame.
     *
     * @subscribe PLAY_MINIGAME_TOPIC, PREPARE_SHOT_TOPIC
     */
    onResetStatus: function() {
        this._lastResult = null;
    }
});