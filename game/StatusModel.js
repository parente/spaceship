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
    postMixInProperties: function() {
        // result of the last action
        this._lastResult = null;
    },
    
    postCreate: function() {
        // start listening for requests to show messages
        this.subscribe(spaceship.game.HIT_SHIP_TOPIC, 'onHitShip');
        this.subscribe(spaceship.game.CHANGE_SHIELDS_TOPIC, 'onChangeShields');
        this.subscribe(spaceship.game.CHANGE_AMMO_TOPIC, 'onChangeAmmo');
        this.subscribe(spaceship.game.MISS_SHIP_TOPIC, 'onMissShip');
        this.subscribe(spaceship.game.HINT_TOPIC, 'onGetHint');
        this.subscribe(spaceship.game.WARP_TOPIC, 'onTimeWarp');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
    },
    
    uninitialize: function() {
        this.unsubscribeAll();
    },

    onEndGame: function() {
        this.destroyRecursive();
    },
    
    getShotMessage: function(ammo) {
        var msgs = this.getLastResult();
        if(this._lastResult == null || 
            this._lastResult.topic == spaceship.game.CHANGE_AMMO_TOPIC) {
            msgs.push(this.labels.SHOT_MESSAGE);
        } else {
            var template = (ammo == 1) ? 
                this.labels.AMMO_REMAIN_MESSAGE : this.labels.AMMOS_REMAIN_MESSAGE;
            msgs.push(dojo.string.substitute(template, {ammo : ammo}));
        }
        return msgs;
    },
    
    getMinigameMessage: function(outcome) {
        var msgs = this.getLastResult();
        var template = this.labels.MINIGAME_MESSAGE;
        msgs.push(dojo.string.substitute(template, {challenge : outcome.getLabel()}));
        return msgs;
    },

    getLastResult: function() {
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
    
    onHitShip: function(state, remain) {
        var msgs = [this.labels.HIT_MESSAGE];
        var template = (remain == 1) ? 
            this.labels.HIT_REMAIN_MESSAGE : this.labels.HITS_REMAIN_MESSAGE;
        msgs[1] = dojo.string.substitute(template, {enemies : remain});
        this._lastResult = {topic: spaceship.game.HIT_SHIP_TOPIC, msgs: msgs};
    },

    onMissShip: function(state, remain) {
        var msgs = [this.labels.MISS_MESSAGE, ''];
        this._lastResult = {topic: spaceship.game.MISS_SHIP_TOPIC, msgs: msgs};
    },
    
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
    
    onTimeWarp: function(state, indices, remain) {
        var msgs = [this.labels.WARP_MESSAGE];
        var template = (remain == 1) ? 
            this.labels.GOAL_MESSAGE : this.labels.GOALS_MESSAGE;
        msgs[1] = dojo.string.substitute(template, {enemies : remain});
        this._lastResult = {topic: spaceship.game.WARP_TOPIC, msgs: msgs};
    }
});