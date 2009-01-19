/**
 * Functions for showing a loading message while an application loads.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.utils.LoaderOverlay');

/**
 * Create and show a loader overlay.
 *
 * @return Overlay DOM node
 */
spaceship.utils.LoaderOverlay.show = function() {
    var node = dojo.doc.createElement('div');
    dojo.addClass(node, 'ssLoaderOverlay');
    dojo.place(node, dojo.body(), 'first');
    return node;
}

/**
 * Hide the loader overlay at the node.
 *
 * @param node Overlay DOM node
 */   
spaceship.utils.LoaderOverlay.hide = function(node) {
    dojo.fadeOut({
        node: node,
        duration: 500,
        onEnd: function() {
            dojo.body().removeChild(node);
        }
    }).play();
}