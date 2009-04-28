/**
 * Heads up audio report of ships, shields, and ammo for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.HUDAudio');
dojo.require('dijit._Widget');
dojo.require('spaceship.game.GameTopics');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.sounds.AudioManager');

// @todo: factor out HUD controller
dojo.declare('spaceship.game.HUDAudio', [dijit._Widget,
                                         spaceship.utils.Subscriber], {
    // bundle of locale strings
    labels: null,
    // game model
    model: null,
    // audio manager
    audio: spaceship.sounds.AudioManager,
    
    /**
     * Called after widget construction.
     */
    postMixInProperties: function() {
        // flag set when user cannot give commands to the HUD
        this._frozen = true;        
    },
    
    /**
     * Called after widget creation. Subscribes to game topics.
     */
    postCreate: function(args) {
        // register for key presses on the body of the document
        var node = dojo.body();
        dojo.connect(node, 'onkeypress', this, 'onKeyPress')

        this.subscribe(spaceship.game.LAND_SHOT_TOPIC, 'onLandShot');
        this.subscribe(spaceship.game.PREPARE_SHOT_TOPIC, 'onPrepareShot');
        this.subscribe(spaceship.game.PAUSE_GAME_TOPIC, 'onPauseGame');
        this.subscribe(spaceship.game.RESUME_GAME_TOPIC, 'onResumeGame');
        this.subscribe(spaceship.game.END_GAME_TOPIC, 'onEndGame');
    },
    
    /**
     * Called after widget cleanup. Unsubscribes from all topics.
     */
    uninitialize: function() {
        this.unsubscribeAll();
    },
    
    /**
     * Called when the game pauses. Prevents input.
     *
     * @subscribe PAUSE_GAME_TOPIC
     */
    onPauseGame: function() {
        this._frozen = true;
    },
    
    /**
     * Called when the game resumes. Enables input if preparing a shot.
     *
     * @subscribe RESUME_GAME_TOPIC
     */
    onResumeGame: function() {
        if(this.model.getState() == spaceship.game.PREPARE_SHOT_TOPIC) {
            this._frozen = false;
        }
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
     * Called after a shot hits a tile. Prevents input.
     *
     * @subscribe LAND_SHOT_TOPIC
     */
    onLandShot: function() {
        this._frozen = true;
    },
    
    /**
     * Called when the user starts targeting a shot.
     *
     * @subscribe PREPARE_SHOT_TOPIC
     */
    onPrepareShot: function() {
        this._frozen = false;
    },
    
    /**
     * Called when the user presses a key. Reports ships, shields, ammo.
     *
     * @param event Event object
     */
    onKeyPress: function(event) {
        if(this._frozen) return;
        if(event.charOrCode == 'i') {
            this.speakStatus();
        }
    },
    
    /**
     * Speaks number of ships, shields, and ammo including the current shot.
     */
    speakStatus: function() {
        // stop all speech
        this.audio.stop(spaceship.sounds.SPEECH_CHANNEL);
        this.audio.say(String(this.model.getShips()));
        this.audio.say(this.labels.HUD_SHIPS);
        this.audio.say(String(this.model.getShields()));
        this.audio.say(this.labels.HUD_SHIELDS);
        // add one to count the current shot
        this.audio.say(String(this.model.getAmmo() + 1));
        this.audio.say(this.labels.HUD_AMMO);
    }
});