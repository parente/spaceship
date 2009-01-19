/**
 * User preferences singleton for the Spaceship! game.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.Preferences');

// define all topics
spaceship.game.UPDATE_PREFERENCES = 'ss-updatePrefs';

spaceship.game.Preferences = (function(){
    return {
        soundVolume : 0.70,
        speechVolume: 0.90,
        musicVolume: 0.50,
        speechRate: 200,
        verboseMessages: true
    };
})();