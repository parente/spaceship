/**
 * List speech/sound for a Spaceship! game menu model.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.menu.MenuAudio');
dojo.require('dijit._Widget');
dojo.require('spaceship.menu.MenuTopics');
dojo.require('spaceship.sounds.AudioManager');
dojo.require('spaceship.utils.Subscriber');

dojo.declare('spaceship.menu.MenuAudio', [dijit._Widget,
                                          spaceship.utils.Subscriber], {
    // menu model
    model: null,
    // bundle of config
    config: null,
    // play interrupt sound?
    interrupt: false,
    // audio manager
    audio: spaceship.sounds.AudioManager,
    /**
     * Called after widget creation. Subscribes to menu topics. Speaks the
     * menu title and or first selected item immediately.
     */
    postCreate: function() {
        this.subscribe(spaceship.menu.SELECT_ITEM_TOPIC, 'onSelectItem');
        this.subscribe(spaceship.menu.CANCEL_MENU_TOPIC, 'onCancelMenu');
        this.subscribe(spaceship.menu.END_MENU_TOPIC, 'onEndMenu');
        this.subscribe(spaceship.menu.CHOOSE_ITEM_TOPIC, 'onChooseItem');

        if(this.interrupt) {
            this.audio.stop(spaceship.sounds.SOUND_TRANSITION_CHANNEL);
            this.audio.play(spaceship.sounds.MENU_CANCEL_SOUND, 
                spaceship.sounds.SOUND_TRANSITION_CHANNEL);
        }
        // stop all preceding speech
        this.audio.stop(spaceship.sounds.SPEECH_CHANNEL);
        // announce the title if we have one
        var title = this.model.getTitle();
        if(title) {
            this.audio.say(title, spaceship.sounds.SPEECH_CHANNEL, title);
        }
        // announce the initial selection
        var label = this.model.getSelectedLabel();
        this.audio.say(label, spaceship.sounds.SPEECH_CHANNEL, label);
    },
    
    /**
     * Called after widget cleanup. Unsubscribes from all topics.
     */
    uninitialize: function() {
        this.unsubscribeAll();
    },

    /**
     * Called when the menu is ending. Destroys this widget.
     *
     * @subscribe END_MENU_TOPIC
     */
    onEndMenu: function() {
        this.destroyRecursive();
    },
    
    /**
     * Called when the user cancels a menu.
     *
     *  @subscribe CANCEL_MENU_TOPIC
     */
    onCancelMenu: function() {
        this.audio.stop(spaceship.sounds.SOUND_TRANSITION_CHANNEL);
        this.audio.play(spaceship.sounds.MENU_CANCEL_SOUND, 
            spaceship.sounds.SOUND_TRANSITION_CHANNEL);
    },

    /**
     * Called when the user targets an item for selection.
     *
     * @subscribe SELECT_ITEM_TOPIC
     */    
    onSelectItem: function(item, label) {
        this.audio.stop(spaceship.sounds.SPEECH_CHANNEL);
        this.audio.stop(spaceship.sounds.SOUND_CHANNEL);
        this.audio.play(spaceship.sounds.MENU_SELECT_SOUND, 
            spaceship.sounds.SOUND_CHANNEL);
        this.audio.say(label, spaceship.sounds.SPEECH_CHANNEL, label);
    },

    /**
     * Called when the user chooses the selected item.
     *
     * @subscribe CHOOSE_ITEM_TOPIC
     */        
    onChooseItem: function() {
        this.audio.stop(spaceship.sounds.SOUND_TRANSITION_CHANNEL);
        this.audio.play(spaceship.sounds.MENU_CHOOSE_SOUND, 
            spaceship.sounds.SOUND_TRANSITION_CHANNEL);
    }
});