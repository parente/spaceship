/**
 * HTML model pub/sub topics for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.html.HtmlTopics');

// fired by the HtmlModel when the DOM is going away
spaceship.html.END_HTML_TOPIC = 'ss-htmlEnd';
// fired by the HtmlModel when there is a new root DOM node
spaceship.html.LOAD_HTML_TOPIC = 'ss-htmlLoad';
// fired by the HtmlModel when the user navigates to a readable chunk
spaceship.html.REGARD_HTML_TOPIC = 'ss-regardHtmlChunk'
