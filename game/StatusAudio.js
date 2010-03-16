/**
 * Status event announcer for the Spaceship! game status model.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.StatusAudio');
dojo.require('dijit._Widget');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.sounds.AudioManager');

dojo.declare('spaceship.game.StatusAudio', [dijit._Widget,
                                            spaceship.utils.Subscriber], {
    // status model
    model: null,
    // bundle of config
    config: null,
    // audio manager
    audio: spaceship.sounds.AudioManager,
    
    /**
     * Called after widget construction.
     */
    postMixInProperties: function() {
        this._barrier = null;
        this._transition = false;
    },

    /**
     * Called after widget creation. Subscribes to game topics.
     */
    postCreate: function() {
        this.subscribe(spaceship.game.END_MINIGAME_SERIES_TOPIC, 'onTransition');
        this.subscribe(spaceship.game.START_MINIGAME_SERIES_TOPIC, 'onTransition');
        this.subscribe(spaceship.game.SHOW_STATUS_TOPIC, 'onReportMessage');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
    },
    
    /**
     * Called after widget cleanup. Unsubscribes from all topics. Removes
     * the widget from the parent container.
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
     * Called when the game is transitioning between shooting and a series of
     * minigames.
     *
     * @subscribe END_MINIGAME_SERIES_TOPIC, START_MINIGAME_SERIES_TOPIC
     */
    onTransition: function() {
        this._transition = true;
    },
    
    onReportMessage: function(bar, topic, value) {
        var msgs;
        if(topic == spaceship.game.PREPARE_SHOT_TOPIC) {
            // say message about preparing a shot
            msgs = this.model.getShotMessage(value);
        } else if(topic == spaceship.game.PLAY_MINIGAME_TOPIC) {
            // say message about playing a minigame
            msgs = this.model.getMinigameMessage(value);
        } else if(topic == spaceship.game.WIN_GAME_TOPIC) {
            // say message about winning the game
            msgs = this.model.getWinMessage();
        } else if(topic == spaceship.game.LOSE_GAME_TOPIC) {
            // say message about losing the game
            msgs = this.model.getLoseMessage();
        } else {
            // say last outcome, just before win or loss
            msgs = this.model.getLastActionMessage();
        }
        // filter out empty messages
        msgs = dojo.filter(msgs, function(msg) {
            return !!msg;
        });
        // stop current speech
        this.audio.stop({channel: spaceship.sounds.SPEECH_CHANNEL});
        var count = 0;
        // register observer to count speech messages
        /*var token = this.audio.addObserver(dojo.hitch(this, function(event) {
            if(event.name != 'status') return;
            ++count;
            if (count == msgs.length) {
                audio.removeObserver(token);
                this.onMessageDone();
            }
        }), spaceship.sounds.SPEECH_CHANNEL, ['finished-say']);*/
        // speak messages and play sounds
        var def;
        for(var i=0; i < msgs.length; i++) {
            if(this._transition && i == msgs.length-1) {
                // play the transition sound before the challenge or shot
                // announcement, using the speech channel to ensure queuing
                this.audio.play({url : spaceship.sounds.TRANSITION_SOUND,
                    channel : spaceship.sounds.SPEECH_CHANNEL});
            }
            def = this.audio.say({text : msgs[i], 
                channel : spaceship.sounds.SPEECH_CHANNEL});
        }
        // observe last message so we can continue
        def.anyAfter(dojo.hitch(this, 'onMessageDone'));
        // reset transition
        this._transition = false;
        // add this as responder to barrier and store it
        bar.addResponder(this.id);
        this._barrier = bar;
    },

    /**
     * Called when the last utterance in the status finishes speaking.
     */
    onMessageDone: function() {
        // reset the instance barrier so we're reentrant
        var bar = this._barrier;
        this._barrier = null;
        // notify the barrier
        bar.notify(this.id);
    }
});