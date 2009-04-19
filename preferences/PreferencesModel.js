/**
 * User preferences singleton for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.preferences.PreferencesModel');
dojo.require('dojo.i18n');
dojo.require('spaceship.preferences.types');
dojo.requireLocalization('spaceship.preferences', 'labels');

spaceship.preferences.PreferencesModel = (function() {
    // load labels
    var labels = dojo.i18n.getLocalization('spaceship.preferences', 'labels');
    // build preference type objects
    var objs = {};
    var args = {id : 'speechRate',
                label : labels.SPEECH_RATE_LABEL,
                value : 250,
                minimum : 100, 
                maximum : 600,
                unitLabel : labels.SPEECH_RATE_UNITS
               };
    objs[args.id] = new spaceship.preferences.types.RangeType(args);
    var args = {id : 'speechVolume', 
                label : labels.SPEECH_VOLUME_LABEL,
                value : 1.0,
                minimum : 0.0,
                maximum : 1.0
               };
    objs[args.id] = new spaceship.preferences.types.PercentType(args);
    var args = {id : 'soundVolume', 
                label : labels.SOUND_VOLUME_LABEL,
                value : 0.70,
                minimum : 0.0,
                maximum : 1.0
               };
    objs[args.id] = new spaceship.preferences.types.PercentType(args);
    var args = {id : 'musicVolume', 
                label : labels.MUSIC_VOLUME_LABEL,
                value : 0.15,
                minimum : 0.0,
                maximum : 1.0
               };
    objs[args.id] = new spaceship.preferences.types.PercentType(args);
    var args = {id : 'mouseControl', 
                label : labels.MOUSE_CONTROL_LABEL,
                value : false
               };
    objs[args.id] = new spaceship.preferences.types.BooleanType(args);
    return objs;
})();