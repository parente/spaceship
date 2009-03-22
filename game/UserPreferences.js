/**
 * User preferences singleton for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.UserPreferences');

spaceship.game.UserPreferences = (function(){
    return {
        soundVolume : 0.70,
        speechVolume: 1.0,
        musicVolume: 0.20,
        speechRate: 300,
        verboseMessages: true,
        mouse: false
    };
})();