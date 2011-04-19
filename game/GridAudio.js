/**
 * Grid event announcer for the Spaceship! game model.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.GridAudio');
dojo.require('dijit._Widget');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.sounds.AudioManager');

dojo.declare('spaceship.game.GridAudio', [dijit._Widget,
                                          spaceship.utils.Subscriber], {
    // status model
    model: null,
    // bundle of labels
    labels: null,
    // bundle of config
    config: null,
    // audio manager
    audio: spaceship.sounds.AudioManager,
    
    /**
     * Called after widget construction.
     */
    postMixInProperties: function() {
        // barrier to notify after playing grid audio
        this._barrier = null;
        // timer for delayed speech
        this._timer = null;
    },
    
    /**
     * Called after widget creation. Subscribes to game topics.
     */
    postCreate: function() {
        this.subscribe(spaceship.game.TARGET_TILE_TOPIC, 'onTargetTile');
        this.subscribe(spaceship.game.PREPARE_SHOT_TOPIC, 'onPrepareShot');
        this.subscribe(spaceship.game.LAND_SHOT_TOPIC, 'onHitTile');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
        this.subscribe(spaceship.game.BAD_TARGET_TOPIC, 'onBadTarget');
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
     * Called when the user starts targeting a shot.
     *
     * @param bar Barrier to notify when the shot report completes
     * @subscribe PREPARE_SHOT_TOPIC
     */
    onPrepareShot: function(bar) {
        this._barrier = bar;
        // announce tile immediately
        this.onTargetTile(this.model.getTargetedTile())
    },
    
    /**
     * Called when the user targets a new tile.
     *
     * @subscribe TARGET_TILE_TOPIC
     */
    onTargetTile: function(index) {
        // clear last timer
        clearTimeout(this._timer);
        // stop current speech and sound
        this.audio.stop({channel : spaceship.sounds.SOUND_CHANNEL});
        this.audio.stop({channel : spaceship.sounds.SPEECH_CHANNEL});
        // play the selection sound
        this.audio.play({
            url : spaceship.sounds.GRID_SELECT_SOUND,
            channel : spaceship.sounds.SOUND_CHANNEL
        });
        // speak the tile state
        var tile = this.model.getTile(index);
        var text;
        if(tile.isRevealed()) {
            text = tile.getLabel();
            this.audio.say({
                text : text, 
                cache: true,
                channel : spaceship.sounds.SPEECH_CHANNEL
            });
        }
        // speak the index as row/column
        var obj = {};
        obj.row = Math.floor(index / this.config.columns) + 1;
        obj.column = (index % this.config.columns) + 1;
        text = dojo.replace(this.labels.HINT_CELL_MESSAGE, obj);
        this._timer = setTimeout(dojo.hitch(this, function() {
            this.audio.say({
                text : text, 
                cache : true,
                channel : spaceship.sounds.SPEECH_CHANNEL
            });
            // @todo: might want to start timer after deferred fires
            this._timer = setTimeout(dojo.hitch(this, function() {
                text = tile.isRevealed() ? this.labels.PROMPT_MOVE_MESSAGE : this.labels.PROMPT_SHOOT_MESSAGE;
                this.audio.say({
                    text : text, 
                    cache : true,
                    channel : spaceship.sounds.SPEECH_CHANNEL
                });
            }), 4000);
        }), 500);
    },

    /**
     * Called when the user tries to target a non-existant tile.
     *
     * @subscribe BAD_TARGET_TOPIC
     */    
    onBadTarget: function(index) {
        clearTimeout(this._timer);
        // stop current speech and sound
        this.audio.stop({channel : spaceship.sounds.SOUND_CHANNEL});
        this.audio.stop({channel : spaceship.sounds.SPEECH_CHANNEL});
        // play the boundary sound
        this.audio.play({
            url : spaceship.sounds.GRID_BOUNDARY_SOUND,
            channel : spaceship.sounds.SOUND_CHANNEL
        });
    },
    
    /**
     * Called when the user shoots a tile
     *
     * @subscribe LAND_SHOT_TOPIC
     */
    onHitTile: function(tile) {
        clearTimeout(this._timer);
        var snd = tile.getSoundUrl();
        // stop current speech and sound
        this.audio.stop({channel : spaceship.sounds.SPEECH_CHANNEL});
        this.audio.stop({channel : spaceship.sounds.SOUND_CHANNEL});
        // play sound
        var def = this.audio.play({url : snd, 
            channel: spaceship.sounds.SOUND_CHANNEL});
        def.anyAfter(dojo.hitch(this, 'onSoundDone'));
        // add this as responder to barrier and store it
        this._barrier.addResponder(this.id);
    },
    
    /**
     * Called when audio for shooting a tile ends. Notifies the barrier.
     */
    onSoundDone: function() {
        // reset the instance barrier so we're reentrant
        var bar = this._barrier;
        this._barrier = null;
        // notify the barrier
        bar.notify(this.id);
    }
});

// add sound support to tiles
(function() {
    var map = {
        'spaceship.game.ShipTile' : spaceship.sounds.SHIP_TILE_SOUND,
        'spaceship.game.EmptyTile' : spaceship.sounds.EMPTY_TILE_SOUND,
        'spaceship.game.AmmoTile' : spaceship.sounds.AMMO_TILE_SOUND,
        'spaceship.game.HintTile' : spaceship.sounds.HINT_TILE_SOUND,
        'spaceship.game.ShieldTile' : spaceship.sounds.SHIELD_TILE_SOUND,
        'spaceship.game.LeechTile' : spaceship.sounds.LEECH_TILE_SOUND,
        'spaceship.game.BombTile' : spaceship.sounds.BOMB_TILE_SOUND,
        'spaceship.game.WarpTile' : spaceship.sounds.WARP_TILE_SOUND
    };
    dojo.extend(spaceship.game.Tile, {
        getSoundUrl: function() {
            return map[this.declaredClass];
        }
    });
})();