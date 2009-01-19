/**
 * Status event announcer for the Spaceship! game status model.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.StatusAudio');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.sounds.AudioManager');

dojo.declare('spaceship.game.StatusAudio', spaceship.utils.Subscriber, {
    // status model
    model: null,
    // bundle of config
    config: null,
    // audio manager
    audio: spaceship.sounds.AudioManager,
    constructor: function(args) {
        dojo.mixin(this, args);
        this.id = Math.random();
        this._barrier = null;
        this.subscribe(spaceship.game.SHOW_STATUS_TOPIC, 'onSayMessage');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
    },
    
    onEndGame: function() {
        this.unsubscribeAll();
    },
    
    onSayMessage: function(bar, topic, value) {
        var msgs;
        if(topic == spaceship.game.PREPARE_SHOT_TOPIC) {
            msgs = this.model.getShotMessage(value);
        } else if(topic == spaceship.game.PLAY_MINIGAME_TOPIC) {
            msgs = this.model.getMinigameMessage(value);
        }
        // filter out empty messages
        msgs = dojo.filter(msgs, function(msg) {
            return !!msg;
        });
        // stop current speech
        this.audio.stop(spaceship.sounds.SPEECH_CHANNEL);
        // register observer
        var count = 0;
        var token = this.audio.addObserver(dojo.hitch(this, function(audio, event) {
            if(event.name != 'status') return;
            ++count;
            if(count == msgs.length) {
                audio.removeObserver(token);
                this.onMessageDone();
            }
        }), spaceship.sounds.SPEECH_CHANNEL, ['finished-say']);
        // speak messages
        dojo.forEach(msgs, function(msg) {
            this.audio.say(msg, spaceship.sounds.SPEECH_CHANNEL, 'status');
        }, this);
        // add this as responder to barrier and store it
        bar.addResponder(this.id);
        this._barrier = bar;
    },

    onMessageDone: function() {
        // reset the instance barrier so we're reentrant
        var bar = this._barrier;
        this._barrier = null;
        // notify the barrier
        bar.notify(this.id);
    }
});