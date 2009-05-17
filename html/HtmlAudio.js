/**
 * HTML speech/sound for a Spaceship! game HTML model.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.html.HtmlAudio');
dojo.require('dijit._Widget');
dojo.require('spaceship.html.HtmlTopics');
dojo.require('spaceship.sounds.AudioManager');
dojo.require('spaceship.utils.Subscriber');

dojo.declare('spaceship.html.HtmlAudio', [dijit._Widget,
                                          spaceship.utils.Subscriber], {
    // html model
    model: null,
    // audio manager
    audio: spaceship.sounds.AudioManager,
    
    /**
     * Called after widget creation. Subscribes to HTML topics.
     */
    postCreate : function() {
        // subscribe to html topics
        this.subscribe(spaceship.html.END_HTML_TOPIC, 'onEndHtml');
        this.subscribe(spaceship.html.REGARD_HTML_TOPIC, 'onRegardHtml');
        // check if we have an initial regard to render
        var por = this.model.getCurrentRegard();
        if(por) {
            this.onRegardHtml(por);
        }
    },
    
    /**
     * Called after widget cleanup. Unsubscribes from all topics.
     */
    uninitialize: function() {
        this.unsubscribeAll();
    },
    
    /**
     * Called when the HTML model is destroying. Destroys this widget.
     *
     * @subscribe END_HTML_TOPIC
     */
    onEndHtml: function() {
        this.destroyRecursive();
    },
    
    onRegardHtml: function(node) {
        this.audio.stop(spaceship.sounds.SPEECH_CHANNEL);
        this.audio.say(node.textContent);
    }
});