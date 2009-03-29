/**
 * Static HTML model code for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.html.HtmlModel');
dojo.require('dijit._Widget');
dojo.require('spaceship.html.HtmlTopics');

dojo.declare('spaceship.html.HtmlModel', dijit._Widget, {
    // url of the html page
    url : '',
    uninitialize: function() {
        dojo.publish(spaceship.html.END_HTML_TOPIC);
    },
    
    getUrl: function() {
        return this.url;
    }
});