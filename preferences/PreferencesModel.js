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
     * Invoked by main to kick of the init of the preference model with a query
     * to hark.org site for current pref values.
     */
    startup: function() {  
        // listen for external preference changes (e.g., hark site)
        this.subscribe('/org/hark/prefs/response', 'onUpdateExternalPref');
        // request initial pref values
        dojo.publish('/org/hark/prefs/request');
    },

    /**
     * Creates option objects with their current values and values saved in a 
     * cookie from the last session.
     */
    buildPrefs: function(prefs) {
        // load labels
        var labels = dojo.i18n.getLocalization('spaceship.preferences', 'labels');
        // build preference type objects
        var args;
        args = {id : 'speechRate',
                label : labels.SPEECH_RATE_LABEL,
                value : prefs.speechRate,
                defaultValue : 200,
                minimum : 80, 
                maximum : 600,
                step: 50,
                unitLabel : labels.SPEECH_RATE_UNITS
               };
        this[args.id] = new spaceship.preferences.types.RangeType(args);
        args = {id : 'speechVolume', 
                label : labels.SPEECH_VOLUME_LABEL,
                value : prefs.speechVolume,
                defaultValue : 1.0,
                minimum : 0.0,
                maximum : 1.0,
                step : 0.05
               };
        this[args.id] = new spaceship.preferences.types.PercentType(args);
        args = {id : 'soundVolume', 
                label : labels.SOUND_VOLUME_LABEL,
                value : prefs.soundVolume,
                defaultValue : 0.80,
                minimum : 0.0,
                maximum : 1.0,
                step : 0.05
               };
        this[args.id] = new spaceship.preferences.types.PercentType(args);
        args = {id : 'musicVolume', 
                label : labels.MUSIC_VOLUME_LABEL,
                value : Number(dojo.cookie('musicVolume')),
                defaultValue : prefs.musicVolume,
                minimum : 0.0,
                maximum : 1.0,
                step : 0.05
               };
        this[args.id] = new spaceship.preferences.types.PercentType(args);
        args = {id : 'mouseEnabled', 
                label : labels.MOUSE_CONTROL_LABEL,
                value : prefs.mouseEnabled,
                defaultValue : false
               };
        this[args.id] = new spaceship.preferences.types.BooleanType(args);
    },

    /**
     * Called when the hark.org site publishes a change to a preference or
     * all initial preferences upon request.
     */
    onUpdateExternalPref: function(prefs, name) {
        if(!name) {
            // build all prefs
            this.buildPrefs(prefs);
        } else if(name === 'volume') {
            // adjust speech, sound, and music volumes
            var volume = prefs.volume;
            var names = ['speechVolume', 'soundVolume', 'musicVolume'];
            for(var i=0, l=names.length; i < l; i++) {
                var subVolume = names[i];
                var opt = this[subVolume];
                // @todo: probably shouldn't be linear but hark should handle
                opt.setValue(prefs[subVolume] * volume);
            }
        } else {
            this[name].setValue(prefs[name]);
        }
    }
});

// singleton
spaceship.preferences.PreferencesModel = new spaceship.preferences.PreferencesModel();
