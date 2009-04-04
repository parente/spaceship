/**
 * Static HTML model code for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.html.HtmlModel');
dojo.require('dijit._Widget');
dojo.require('spaceship.html.HtmlTopics');
dojo.require('dijit.layout.ContentPane');

dojo.declare('spaceship.html.HtmlModel', dijit._Widget, {
    // url of the html page
    url : '',
    // root DOM node
    root: null,
    
    /**
     * Called after widget cleanup. Notifies all listeners that the HTML is
     * going away.
     *
     * @publish END_HTML_TOPIC
     */
    uninitialize: function() {
        dojo.publish(spaceship.html.END_HTML_TOPIC);
    },
    
    /**
     * Called when HTML at the current URL loads successfully.
     *
     * @param response String HTML
     */
    _onLoadHtml: function(response) {
        this.root = dojo.doc.createElement('div');
        this.root.innerHTML = response;
        // make all links open in new windows / tabs
        dojo.query('a', this.root).forEach(function(a) {
            dojo.attr(a, 'target', '_blank');
        });
        dojo.publish(spaceship.html.LOAD_HTML_TOPIC); 
    },
    
    /**
     * Loads the HTML DOM of content at the given URL.
     *
     * @param url String URL
     * @publish LOAD_HTML_TOPIC
     */
    _setUrlAttr: function(url) {
        this.root = null;
        this.url = url;
        var args = {url : this.url, handleAs : 'text'};
        var def = dojo.xhrGet(args);
        def.addCallback(dojo.hitch(this, this._onLoadHtml));
    },
    
    /**
     * Gets the URL held by this model, valid or invalid.
     *
     * @return String URL
     */
    _getUrlAttr: function() {
        return this.url;
    },
    
    /**
     * Gets the root of the DOM constructed by this model from HTML.
     *
     * @return DOM node or null
     */
    getDOM: function() {
        return this.root;
    }
});