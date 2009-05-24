/**
 * HTML view/controller for a Spaceship! game HTML model.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.html.HtmlView');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit._Container');
dojo.require('spaceship.html.HtmlTopics');
dojo.require('spaceship.utils.Subscriber');

// @todo: factor out html controller
dojo.declare('spaceship.html.HtmlView', [dijit.layout.ContentPane,
                                         dijit._Contained,
                                         spaceship.utils.Subscriber], {
    // html model
    model: null,
    /**
     * Called after widget creation. Subscribes to HTML topics. Configures the
     * content pane.
     */
    postCreate : function() {
        // configure the dijit.layout.ContentPane
        dojo.addClass(this.domNode, 'ssHtmlView');
        dojo.attr(this.domNode, 'tabIndex', '0');
        this.connect(this.domNode, 'onkeypress', 'onKeyPress');
        // subscribe to html topics
        this.subscribe(spaceship.html.END_HTML_TOPIC, 'onEndHtml');
        this.subscribe(spaceship.html.LOAD_HTML_TOPIC, 'onLoadHtml');
        // check if we have an initial DOM to render
        this.onLoadHtml();
    },
    
    /**
     * Called after widget cleanup. Unsubscribes from all topics. Removes
     * the widget from the parent container.
     */
    uninitialize: function() {
        this.unsubscribeAll();
        var parent = this.getParent();
        parent.removeChild(this);
    },
    
    /**
     * Called when the HTML panel shows. Gives keyboard focus to the panel.
     */
    onShow: function() {
        // give the table focus
        dijit.focus(this.domNode);
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
        this.attr('content', this.model.getDOM());
    },
    
    /**
     * Called when the user presses a key.
     *
     * @param event Event object
     */
    onKeyPress: function(event) {
        switch(event.keyCode) {
        case dojo.keys.ESCAPE:
            this.model.destroyRecursive();
            break;
        case dojo.keys.DOWN_ARROW:
        case dojo.keys.RIGHT_ARROW:
            this.model.regardNextChunk();
            dojo.stopEvent(event);
            break;
        case dojo.keys.LEFT_ARROW:
        case dojo.keys.UP_ARROW:
            this.model.regardPreviousChunk();
            dojo.stopEvent(event);
            break;
        }
    }
});