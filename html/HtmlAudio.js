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

// @todo: factor out html controller
dojo.declare('spaceship.html.HtmlAudio', [dijit._Widget,
                                          spaceship.utils.Subscriber], {
    // html model
    model: null,
    // audio manager
    audio: spaceship.sounds.AudioManager,
    /**
     * Called after widget construction.
     */
    postMixInProperties: function() {
        // audio subscription token
        this._token = null;
        // start reading text continuously right away
        this._continuous = true;
    },
    
    /**
     * Called after widget creation. Subscribes to HTML topics.
     */
    postCreate : function() {
        // subscribe to html topics
        this.subscribe(spaceship.html.END_HTML_TOPIC, 'onEndHtml');
        this.subscribe(spaceship.html.LOAD_HTML_TOPIC, 'onLoadHtml');
        this.subscribe(spaceship.html.REGARD_HTML_TOPIC, 'onRegardHtml');
        // listen for end of chunk speech events
        this._token = this.audio.addObserver(dojo.hitch(this, this.onSayDone),
            spaceship.sounds.SPEECH_CHANNEL, ['finished-say', 'error']);
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
        this.audio.removeObserver(this._token);
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
    
    /**
     * Called when the HTML model has a new DOM.
     *
     * @subscribe LOAD_HTML_TOPIC
     */
    onLoadHtml: function() {
        var node = this.model.getDOM();
        if(node.parentNode) {
            this.connect(node.parentNode, 'onkeypress', 'onKeyPress');
        }
        
    },
    
    /**
     * Called when the point of regard is moved to a different chunk in the
     * HTML model.
     *
     * @param node DOM node under regard.
     * @subscribe REGARD_HTML_TOPIC
     */
    onRegardHtml: function(node) {
        this.audio.stop({channel : spaceship.sounds.SPEECH_CHANNEL});
        this.audio.say({text: node.textContent, 
            channel : spaceship.sounds.SPEECH_CHANNEL, 
            name : 'chunk'});
    },

    /**
     * Called when the text of the current regard is finished being said.
     *
     * @param response Audio response object
     */
    onSayDone: function(response) {
        if(this._continuous && response.name == 'chunk' && response.completed) {
            // regard the next chunk
            this.model.regardNextChunk();
        }
    },
    
    /**
     * Called when the user presses a key.
     *
     * @param event Event object
     */
    onKeyPress: function(event) {
        // get the appropriate code for the key
        var code = event.charCode || event.keyCode;        
        switch(code) {
            case dojo.keys.SPACE:
            case dojo.keys.ENTER:
                // read continuously starting with the current chunk
                var por = this.model.getCurrentRegard();
                if(por) {
                    this._continuous = true;
                    this.onRegardHtml(por);
                }
                dojo.stopEvent(event);
                break;
            default:
                // reset continuous flag
                this._continuous = false;
        }
    }
});