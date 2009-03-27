/**
 * Status event viewer for the Spaceship! game status model.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.StatusView');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Container');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.utils.Subscriber');

dojo.declare('spaceship.game.StatusView', [dijit._Widget, 
                                           dijit._Templated, 
                                           dijit._Contained,
                                           spaceship.utils.Subscriber], {
    // status model
    model: null,
    // path to template file
    templatePath: dojo.moduleUrl('spaceship', 'templates/StatusView.html'),
    postMixInProperties: function() {
        // barrier to notify on message done
        this._barrier = null;
        // is game over?
        this._gameOver = false;
    },
    
    postCreate: function() {
        // start listening for requests to show messages
        this.subscribe(spaceship.game.SHOW_STATUS_TOPIC, 'onShowMessage');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
    },
    
    resize: function(size) {
        dojo.marginBox(this.domNode, size);
    },
    
    /**
     * Called when the game grid panel shows. Gives keyboard focus to the 
     * table.
     */
    onShow: function() {
        // give the table focus
        dijit.focus(this._panelNode);
    },
    
    uninitialize: function() {
        this.unsubscribeAll();
        var parent = this.getParent();
        parent.removeChild(this);
    },
    
    onEndGame: function() {
        this.destroyRecursive();
    },
     
    onShowMessage: function(bar, topic, value) {
        var msgs;
        if(topic == spaceship.game.PREPARE_SHOT_TOPIC) {
            msgs = this.model.getShotMessage(value);
        } else if(topic == spaceship.game.PLAY_MINIGAME_TOPIC) {
            msgs = this.model.getMinigameMessage(value);
        } else if(topic == spaceship.game.WIN_GAME_TOPIC) {
            msgs = this.model.getWinMessage();
            this._gameOver = true;
        } else if(topic == spaceship.game.LOSE_GAME_TOPIC) {
            msgs = this.model.getLoseMessage();
            this._gameOver = true;
        } else {
            msgs = this.model.getLastActionMessage();
        }
        // insert the message text
        this._changeMessageNode.textContent = msgs[0];
        this._statusMessageNode.textContent = msgs[1];
        this._nextMessageNode.textContent = msgs[2];
        // show the message pane in its container
        var parent = this.getParent();
        parent.selectChild(this);
        // add this as responder to barrier and store it
        bar.addResponder(this.id);
        this._barrier = bar;
        if(!this._gameOver) {
            // wait at least a little while for the player to read the text
            setTimeout(dojo.hitch(this, this.onMessageDone), 2000);
        }
    },
    
    onMessageDone: function() {
        // reset the instance barrier so we're reentrant
        var bar = this._barrier;
        this._barrier = null;
        // notify the barrier
        bar.notify(this.id);
    },
    
    onKeyPress: function(event) {
        if(this._gameOver) {
            this.onMessageDone();
        }
    }
});