/**
 * Minigame manager code for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.minigame.MiniGameManager');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Container');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.sounds.AudioManager');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.minigame.Outcome');

dojo.declare('spaceship.minigame.MiniGameManager', [dijit._Widget,
                                                    dijit._Templated,
                                                    dijit._Contained,
                                                    spaceship.utils.Subscriber], {
    // main game model
    model: null,
    // bundle of locale strings
    labels: null,
    // bundle of game config
    config: null,
    // main game model
    model: null,
    // template for grid which is built dynamically for the most part
    templatePath: dojo.moduleUrl('spaceship', 'templates/MiniGameManager.html'),
    postMixInProperties: function() {
        // barrier for minigame play
        this._barrier = null;
        // outcome of minigame
        this._outcome = null;
        // catalog of minigames
        this._catalog = null;
        // current game
        this._game = null;
        // win and lose subscribe tokens
        this._winTok = null;
        this._loseTok = null;
    },
    
    /**
     * Register for dojo.publish topics. Load list of games.
     */
    postCreate: function() {
        this.subscribe(spaceship.game.PLAY_MINIGAME_TOPIC, 'onStartMiniGame');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
        // fetch the catalog of games
        var request = {
          url : 'minigame/catalog.json',
          handleAs : 'json',
          preventCache: true
        };
        var def = dojo.xhrGet(request);
        def.addCallback(dojo.hitch(this, function(data) {
            this._catalog = data;
            if(this._barrier) {
                // game request already happened while we were waiting for
                // the catalog; start it again
                this.onStartMiniGame(this._barrier, this._outcome);
            }
        }));
    },
    
    /**
     * Unsubscribes from all topics during widget destruction. Removes widget
     * from its parent container.
     */
    uninitialize: function() {
        dojo.unsubscribe(this._winTok);
        dojo.unsubscribe(this._loseTok);
        this.unsubscribeAll();
        var parent = this.getParent();
        parent.removeChild(this);
    },
    
    /**
     * Called when the minigame panel shows. Gives keyboard focus to the 
     * root domNode.
     */
    onShow: function() {
        dijit.focus(this._panelNode);
    },
    
    /**
     * Called when the main game needs to start a new minigame. Picks a random
     * minigame to play and initializes it.
     *
     * @param bar Barrier to notify when game is done
     * @param outcome Outcome object to update
     */
    onStartMiniGame: function(bar, outcome) {
        this._barrier = bar;
        this._outcome = outcome;
        if(!this._catalog) {
            // abort if catalog not ready yet
            return;
        }
        
        // show the game space
        dojo.style(this._panelNode, {visibility : 'visible'});
        
        // pick a minigame
        var i = Math.floor(Math.random()*this._catalog.length)
        var obj = this._catalog[i];
        var clsName = obj['class'];
        var modName = 'spaceship.minigame.'+obj.module+'.'+clsName;
        // load the game module
        dojo.require(modName);
        // pack up the game arguments
        var args = {
            audio : spaceship.sounds.AudioManager,
            // @todo: randomize to prevent bad minigame cheating
            win_topic : 'ss-winMinigame',
            lose_topic : 'ss-loseMinigame',
        };

        // register for win/lose topics
        this._winTok = dojo.subscribe(args.win_topic, this, 'onLoseMiniGame');
        this._loseTok = dojo.subscribe(args.lose_topic, this, 'onWinMiniGame');
        
        // create the game
        var node = dojo.doc.createElement('div');
        this._boxNode.appendChild(node);
        var cls = spaceship.minigame[obj.module][clsName];
        this._game = new cls(args, node);
        
        // check if game wants to prefetch
        var urls = this._game.onGetPreCache();
        if(urls.length) {
            // @todo: precache and wait for complete before doing anything else
        } else {
            // continue with start immediately
            this._notifyGameStart();
        }
    },
    
    _notifyGameStart: function() {
        // show the minigame manager pane in its container
        var parent = this.getParent();
        parent.selectChild(this);
        // notify starting minigame
        dojo.publish(spaceship.game.START_MINIGAME_TOPIC);
        // inform minigame of start
        this._game.onStart();
    },
    
    _notifyGameEnd: function() {
        // hide the game space
        dojo.style(this._panelNode, {visibility : 'hidden'});
        // unregister for win/lose
        dojo.unsubscribe(this._winTok);
        dojo.unsubscribe(this._loseTok);
        // inform minigame of end
        this._game.onEnd();
        // destroy descendants
        this.destroyDescendants();
        this._game = null;
        // notify ending minigame
        dojo.publish(spaceship.game.END_MINIGAME_TOPIC); 
        // notify barrier
        var bar = this._barrier;
        this._barrier = null;
        bar.notify();
    },
    
    onWinMiniGame: function() {
        this._outcome.win(this.model);
        this._notifyGameEnd();
    },
    
    onLoseMiniGame: function() {
        this._outcome.lose(this.model);
        this._notifyGameEnd();
    },
    
    /**
     * Called when the main game ends. Cleans up the widget and its children.
     */
    onEndGame: function() {
        this.destroyRecursive();
    },
    
    onKeyDown: function(event) {
        if(this._game) this._game.onKeyDown(event);
    },
    
    onKeyUp: function(event) {
        if(this._game) this._game.onKeyUp(event);        
    },
    
    onKeyPress : function(event) {
        // get the appropriate code for the key
        var code = (event.isChar) ? event.charCode : event.keyCode;
        if(code == dojo.keys.ESCAPE) {
            // pause the minigame
            dojo.publish(spaceship.game.PAUSE_MINIGAME_TOPIC, 
                [spaceship.game.RESUME_MINIGAME_TOPIC]);
            return;
        }
        if(this._game) this._game.onKeyPress(event);        
    }
});