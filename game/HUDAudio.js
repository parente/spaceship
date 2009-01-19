/**
 * Heads up audio report of ships, shields, and ammo for the Spaceship! game.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.HUDAudio');
dojo.require('spaceship.sounds.AudioManager');

// @todo: should factor out keys into a controller and listen for pub topics
//   so we can support other controllers in the future
dojo.declare('spaceship.game.HUDAudio', null, {
    // bundle of locale strings
    labels: null,
    // game model
    model: null,
    // audio manager
    audio: spaceship.sounds.AudioManager,
    constructor: function(args) {
        dojo.mixin(this, args);
        // register for key presses on the body
        var node = dojo.body();
        dojo.connect(node, 'onkeypress', this, 'onKeyPress')
    },
    
    onKeyPress: function(event) {
        if(event.charOrCode == 'i') {
            this.speakStatus();
        }
    },
    
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