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
    // @todo: support reading of html by chunks
});