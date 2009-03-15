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
dojo.require('dojo.string');

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
    postMixInProperties: function() {
        this._barrier = null;
    },
    
    /**
     * Register for dojo.publish topics.
     */
    postCreate: function() {
        this.subscribe(spaceship.game.TARGET_TILE_TOPIC, 'onTargetTile');
        this.subscribe(spaceship.game.PREPARE_SHOT_TOPIC, 'onPrepareShot');
        this.subscribe(spaceship.game.LAND_SHOT_TOPIC, 'onHitTile');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
    },
    
    uninitialize: function() {
        this.unsubscribeAll();
    },
    
    onEndGame: function() {
        this.destroyRecursive();
    },
    
    onPrepareShot: function(bar) {
        this._barrier = bar;
        // announce tile immediately
        this.onTargetTile(this.model.getTargetedTile())
    },
    
    onTargetTile: function(index) {
        // stop current speech and sound
        this.audio.stop(spaceship.sounds.SOUND_CHANNEL);
        this.audio.stop(spaceship.sounds.SPEECH_CHANNEL);
        // play the selection sound
        this.audio.play(spaceship.sounds.GRID_SELECT_SOUND,
            spaceship.sounds.SOUND_CHANNEL);
        // speak the tile state
        var tile = this.model.getTile(index);
        var text;
        if(tile.isRevealed()) {
            text = tile.getLabel();
            this.audio.say(text, spaceship.sounds.SPEECH_CHANNEL);            
        }
        // speak the index as row/column
        var obj = {};
        obj.row = Math.floor(index / this.config.columns) + 1;
        obj.column = (index % this.config.columns) + 1;
        text = dojo.string.substitute(this.labels.HINT_CELL_MESSAGE, obj);
        this.audio.say(text, spaceship.sounds.SPEECH_CHANNEL);
    },
    
    onHitTile: function(tile) {
        var snd = tile.getSoundUrl();
        // stop current speech and sound
        this.audio.stop(spaceship.sounds.SPEECH_CHANNEL);
        this.audio.stop(spaceship.sounds.SOUND_CHANNEL);
        // register observer
        var token = this.audio.addObserver(dojo.hitch(this, function() {
            this.audio.removeObserver(token);
            this.onSoundDone();
        }), 0, ['finished-play', 'error']);
        // play sound
        this.audio.play(snd);
        // add this as responder to barrier and store it
        this._barrier.addResponder(this.id);
    },
    
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