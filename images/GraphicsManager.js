/**
* Graphics manager for the Spaceship! game.
*
* Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
* http://creativecommons.org/licenses/BSD/
*/
dojo.provide('spaceship.images.GraphicsManager');

// catalog of image files
spaceship.images = {
    LOGO_IMAGE : dojo.moduleUrl('spaceship.images.png', 'logo.png').uri,
    WATERMARK_IMAGE : dojo.moduleUrl('spaceship.images.png', 'spaceship.png').uri,
    HIDDEN_TILE_IMAGE : dojo.moduleUrl('spaceship.images.png', 'hidden.png').uri,
    SHIP_TILE_IMAGE : dojo.moduleUrl('spaceship.images.png', 'ship.png').uri,
    EMPTY_TILE_IMAGE : dojo.moduleUrl('spaceship.images.png', 'empty.png').uri,
    AMMO_TILE_IMAGE : dojo.moduleUrl('spaceship.images.png', 'ammo.png').uri,
    HINT_TILE_IMAGE : dojo.moduleUrl('spaceship.images.png', 'hint.png').uri,
    SHIELD_TILE_IMAGE : dojo.moduleUrl('spaceship.images.png', 'shield.png').uri,
    LEECH_TILE_IMAGE : dojo.moduleUrl('spaceship.images.png', 'leech.png').uri,
    BOMB_TILE_IMAGE : dojo.moduleUrl('spaceship.images.png', 'bomb.png').uri,
    WARP_TILE_IMAGE : dojo.moduleUrl('spaceship.images.png', 'warp.png').uri,
    LEFT_ARROW_IMAGE : dojo.moduleUrl('spaceship.images.png', 'left-arrow.png').uri,
    RIGHT_ARROW_IMAGE : dojo.moduleUrl('spaceship.images.png', 'right-arrow.png').uri
};

dojo.declare('spaceship.images.GraphicsManager', null, {
    /** 
     * Initializes the Outfox graphics by precaching all main game images.
     *
     * @return dojo.Deferred which notifies graphics init success or error
     */
    startup: function() {
        // create a deferred
        var ready = new dojo.Deferred();
        // precache all images
        var imgs = [];
        for(var key in spaceship.images) {
            if(key.search('_IMAGE') != -1) {
                imgs.push(spaceship.images[key]);
            }
        }
        var total = imgs.length;
        dojo.forEach(imgs, function(url) {
            var args = {url : url};
            var def = dojo.xhrGet(args);
            def.addBoth(function() { 
                --total;
                if(total == 0) ready.callback(true);
            });
        });
        return ready;
    }
});

// build a singleton graphics manager
spaceship.images.GraphicsManager = new spaceship.images.GraphicsManager();