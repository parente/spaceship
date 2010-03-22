/**
 * User preferences singleton for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.preferences.PreferencesModel');
dojo.require('spaceship.utils.Subscriber');
dojo.require('spaceship.preferences.types');
dojo.require('spaceship.preferences.PreferencesTopics');
dojo.require('dojo.i18n');
dojo.requireLocalization('spaceship.preferences', 'labels');

dojo.declare('spaceship.preferences.PreferencesModel', spaceship.utils.Subscriber, {
    /**
     * Object constructor. Creates option objects with their default values
     * and values saved in a cookie from the last session.
     */
    constructor: function() {
        // load labels
        var labels = dojo.i18n.getLocalization('spaceship.preferences', 'labels');
        // build preference type objects
        var args;
        args = {id : 'speechRate',
                label : labels.SPEECH_RATE_LABEL,
                value : Number(dojo.cookie('speechRate')),
                defaultValue : 250,
                minimum : 100, 
                maximum : 600,
                step: 50,
                unitLabel : labels.SPEECH_RATE_UNITS
               };
        this[args.id] = new spaceship.preferences.types.RangeType(args);
        args = {id : 'speechVolume', 
                label : labels.SPEECH_VOLUME_LABEL,
                value : Number(dojo.cookie('speechVolume')),
                defaultValue : 1.0,
                minimum : 0.0,
                maximum : 1.0,
                step : 0.05
               };
        this[args.id] = new spaceship.preferences.types.PercentType(args);
        args = {id : 'soundVolume', 
                label : labels.SOUND_VOLUME_LABEL,
                value : Number(dojo.cookie('soundVolume')),
                defaultValue : 0.70,
                minimum : 0.0,
                maximum : 1.0,
                step : 0.05
               };
        this[args.id] = new spaceship.preferences.types.PercentType(args);
        args = {id : 'musicVolume', 
                label : labels.MUSIC_VOLUME_LABEL,
                value : Number(dojo.cookie('musicVolume')),
                defaultValue : 0.15,
                minimum : 0.0,
                maximum : 1.0,
                step : 0.05
               };
        this[args.id] = new spaceship.preferences.types.PercentType(args);
        args = {id : 'mouseControl', 
                label : labels.MOUSE_CONTROL_LABEL,
                value : Boolean(dojo.cookie('mouseControl')),
                defaultValue : false
               };
        this[args.id] = new spaceship.preferences.types.BooleanType(args);
    },
    
    startup: function() {  
        // listen for preference changes
        this.subscribe(spaceship.preferences.UPDATE_PREFERENCE_TOPIC, 'onUpdatePref');
    },
    
    /**
     * Called when a preference changes value. Updates the local cookie to
     * reflect the new value immediately.
     *
     * @param key String name of the preference that changed
     *
     * @subscribe UPDATE_PREFERENCE_TOPIC string
     */
    onUpdatePref: function(key) {
        var obj = this[key];
        dojo.cookie(key, obj.value);
    }
});

// singleton
spaceship.preferences.PreferencesModel = new spaceship.preferences.PreferencesModel();
