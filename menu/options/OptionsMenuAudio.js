/**
 * Options audio for a Spaceship! options menu model.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.menu.options.OptionsMenuAudio');
dojo.require('spaceship.menu.MenuAudio');
dojo.require('spaceship.preferences.PreferencesTopics');

dojo.declare('spaceship.menu.options.OptionsMenuAudio', spaceship.menu.MenuAudio, {
    /**
     * Extends the base class to register for preference changes.
     */
    postCreate: function() {
        this.inherited(arguments);
        this.subscribe(spaceship.preferences.UPDATE_PREFERENCE_TOPIC, 'onUpdatePref');
    },

    /**
     * Extends the base class to also say the current value of the item.
     *
     * @subscribe RESUME_MENU_TOPIC
     */
    onResumeMenu: function() {
        this.inherited(arguments);
        // announce the current value
        var obj = this.model.getSelectedItem();
        this.audio.say({text : obj.getValueLabel(), 
            channel : spaceship.sounds.SPEECH_CHANNEL});
    },
    
    /**
     * Extends the base class to also say the current value of the item.
     *
     * @subscribe SELECT_ITEM_TOPIC
     */    
    onSelectItem: function(item, label) {
        this.inherited(arguments);
        var obj = this.model.getSelectedItem();
        this.audio.say({text : obj.getValueLabel(), 
            channel : spaceship.sounds.SPEECH_CHANNEL});
    },
    
    /**
     * Called when a preference changes. Reflects the change in the view.
     *
     * @subscribe UPDATE_PREFERENCE_TOPIC
     */
    onUpdatePref: function(key) {
        var obj = this.model.getItemById(key);
        this.audio.stop({channel : spaceship.sounds.SOUND_CHANNEL});
        this.audio.stop({channel : spaceship.sounds.SPEECH_CHANNEL});
        this.audio.say({text : obj.getValueLabel(), 
            channel : spaceship.sounds.SPEECH_CHANNEL});
        if(obj.id == 'soundVolume') {
            // play a sound as a test
            this.audio.play({url : spaceship.sounds.EMPTY_TILE_SOUND,
                channel : spaceship.sounds.SOUND_CHANNEL});
        }
    }
});