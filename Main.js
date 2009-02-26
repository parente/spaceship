/**
 * Startup code for the Spaceship! game.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.Main');
dojo.require('spaceship.utils.LoaderOverlay');

// define all topics
spaceship.SHOW_MAIN_MENU_TOPIC = 'ss-showMainMenu';
spaceship.START_TITLE_TOPIC = 'ss-startTitle';

dojo.declare('spaceship.Main', null, {
    constructor: function() {
        // show the loading overlay immediately
        this._overlayNode = spaceship.utils.LoaderOverlay.show();
        var readyFunc = dojo.hitch(this, 'onLibReady');

        // require modules now
        dojo.require('dojo.i18n');
        dojo.require("dijit.layout.StackContainer");
        dojo.require("dijit.layout.ContentPane");
        dojo.require("dijit.layout.BorderContainer");
        dojo.require('spaceship.sounds.AudioManager');
        dojo.require('spaceship.sounds.Jukebox');
        dojo.require('spaceship.images.GraphicsManager');
        dojo.require('spaceship.game.Preferences');
        dojo.require('spaceship.game.Config');
        dojo.require('spaceship.game.GameModel');
        dojo.require('spaceship.game.GridView');
        dojo.require('spaceship.game.GridAudio');
        dojo.require('spaceship.menu.MenuModel');
        dojo.require('spaceship.menu.MenuView');
        dojo.require('spaceship.menu.MenuAudio');
        dojo.require('spaceship.menu.MenuTopics');
        dojo.require('spaceship.game.StatusModel')
        dojo.require('spaceship.game.StatusView')
        dojo.require('spaceship.game.StatusAudio');
        dojo.require('spaceship.game.HUDView');
        dojo.require('spaceship.game.HUDAudio');
        dojo.require("dojo.parser");
        dojo.requireLocalization('spaceship', 'labels');
        
        // bundle of locale strings
        this._labels = null;
        // bundle of game config
        this._config = null;
        // bag of dojo.subscribe handles
        this._subs = {};
        // center stack container widget
        this._stackWidget = null;
        // footer content pane
        this._footerWidget = null;
        // border layout
        this._layoutWidget = null;
        // menu model
        this._menuModel = null;
        // game model
        this._gameModel = null;
        // music jukebox
        this._jukebox = null;
        // last active panel before a menu shows
        this._lastPanel = null;
        // number of ready reports
        this._readyCount = 0;

        // register for when the page unloads
        dojo.addOnUnload(dojo.hitch(this, this.uninitialize));        
        // register for when all modules load
        dojo.addOnLoad(readyFunc);
        // register for when audio is ready
        var def = spaceship.sounds.AudioManager.startup();
        def.addCallback(readyFunc);
    },
    
    onLibReady: function() {
        ++this._readyCount;
        if(this._readyCount == 2) {
            this.initialize();
        }
    },
    
    /**
     * Unsubscribe from all dojo.publish topics.
     */
    uninitialize: function() {
        for(var key in this._subs) {
            dojo.unsubscribe(this._subs[key]);
        }
    },
    
    initialize: function() {
        // parse the inline page widgets
        dojo.parser.parse();
        
        // get the localized strings bundle
        this._labels = dojo.i18n.getLocalization('spaceship', 'labels');
        
        // get a reference to parsed widgets
        this._stackWidget = dijit.byId('stack');
        this._footerWidget = dijit.byId('footer');
        this._layoutWidget = dijit.byId('layout');
        
        // show the watermark
        var wm = dojo.byId('watermark');
        wm.style.display = '';
        // track stack size to fit watermark graphic in region
        dojo.connect(this._stackWidget, 'resize', this, 'onResizeStack');
        // reflow the border layout widget and watermark
        this.onResizeStack();
        
        // store menu args
        this._mainArgs = {
            labels: [this._labels.NEW_GAME_ITEM, this._labels.OPTIONS_ITEM, 
                     this._labels.NEWS_ITEM, this._labels.CREDITS_ITEM, 
                     this._labels.HELP_ITEM]
        };
        this._returnArgs = {
            labels: [this._labels.RESUME_GAME_ITEM, this._labels.OPTIONS_ITEM, 
                     this._labels.QUIT_GAME_ITEM]
        };
        this._difficultyArgs = {
            labels: dojo.map(spaceship.game.Config, function(cfg) {
                return cfg.label;
            }),
            cancelable: true,
            title: this._labels.DIFFICULTY_TITLE
        };
        this._quitArgs = {
            labels: [this._labels.NO_QUIT_ITEM, this._labels.YES_QUIT_ITEM],
            title: this._labels.QUIT_TITLE
        };
        
        // build a jukebox for music
        this._jukebox = new spaceship.sounds.Jukebox();
        
        // start listening for menu related events
        var func = dojo.hitch(this, 'onActivateMenu');
        this._subs['mainmenu'] = dojo.subscribe(spaceship.SHOW_MAIN_MENU_TOPIC, func);
        // show the main menu immediately
        dojo.publish(spaceship.SHOW_MAIN_MENU_TOPIC)

        // hide the busy overlay
        spaceship.utils.LoaderOverlay.hide(this._overlayNode);
        this._overlayNode = null;
    },
    
    onActivateMenu: function() {
        // destroy any existing menu
        this.endMenu();
        if(this._gameModel) {
            this.startMenu(this._returnArgs, 'onChooseMain');
        } else {
            // indicate title screen is started
            dojo.publish(spaceship.START_TITLE_TOPIC);
            this.startMenu(this._mainArgs, 'onChooseMain');
        }
    },
    
    onResizeStack: function() {
        var size = this._stackWidget._contentBox;
        // center the background graphic
        var img = dojo.byId('watermark');
        var is = dojo.marginBox(img);
        box = {
            top: (size.h - is.h) / 2 + 'px',
            left: (size.w - is.w) / 2 + 'px'
        };
        dojo.style(img, box);
    },
            
    onChooseMain: function(index, label) {
        // destroy the menu immediately
        this.endMenu();
        switch(label) {
        case this._labels.NEW_GAME_ITEM:
            // pick a difficulty
            this.startMenu(this._difficultyArgs, 'onChooseDifficulty');
            break;
        case this._labels.RESUME_GAME_ITEM:
            // nothing to do
            break;
        case this._labels.NEWS_ITEM:
            break;        
        case this._labels.SCORES_ITEM:
            break;
        case this._labels.CREDITS_ITEM:
            break;
        case this._labels.HELP_ITEM:
            break;
        case this._labels.QUIT_GAME_ITEM:
            if(this._gameModel) {
               // make sure we want to quit the current game
               this.startMenu(this._quitArgs, 'onChooseQuit');
            }
            break;
        }
    },
    
    onChooseDifficulty: function(index, label) {
        // destroy the menu immediately
        this.endMenu();
        for(var i=0; i < spaceship.game.Config.length; i++) {
            var config = spaceship.game.Config[i];
            if(config.label == label) {
                this._config = config;
                break;
            }
        }
        this.startGame();
    },
    
    onChooseQuit: function(index, label) {
        // destroy the menu immediately
        this.endMenu();
        if(label == this._labels.YES_QUIT_ITEM) {
            // quit the game
            this.quitGame();
        } else {
            // restart the resume menu
            this.startMenu(this._returnArgs, 'onChooseMain');
        }
    },
    
    startMenu: function(args, cb) {
        // store the last active panel
        this._lastPanel = this._stackWidget.selectedChildWidget;
        // let the menu options drive this controller
        this._subs['choose'] = dojo.subscribe(spaceship.menu.CHOOSE_ITEM_TOPIC, 
            this, cb);
        // create the menu model and add it to the bag
        this._menuModel = new spaceship.menu.MenuModel(args);
        var vargs = {model: this._menuModel};
        var mv = new spaceship.menu.MenuView(vargs);
        var ma = new spaceship.menu.MenuAudio(vargs);
        this._stackWidget.addChild(mv);
        this._stackWidget.selectChild(mv);
    },
    
    endMenu: function() {
        // show the last active panel
        if(this._lastPanel) {
            this._stackWidget.selectChild(this._lastPanel);
            this._lastPanel = null;
        }
        if(this._menuModel) {
            // destroy the menu
            this._menuModel.destroyRecursive();
            this._menuModel = null;
            dojo.unsubscribe(this._subs['choose']);
        }
    },
    
    // @todo: change to put related components into contentpanes which will fire activate/deactivate events
    //   components in the panes will listen for those events to know when they are in focus or not
    //   - main game pane
    //   - menu pane
    //   - status pane
    //   - minigame pane
    startGame: function() {
        // create a bag of common arguments
        var args = {
            labels: this._labels,
            config: this._config
        };
        // create the game model and add it to the bag
        this._gameModel = new spaceship.game.GameModel(args);
        args.model = this._gameModel;
        // create the HUD view and insert it into the footer
        var hv = new spaceship.game.HUDView(args);
        this._footerWidget.attr('content', hv);
        hv.startup();
        var ha = new spaceship.game.HUDAudio(args);
        // hide the logo
        dojo.byId('logo').style.display = 'none';
        // reflow the border layout widget
        this._layoutWidget.resize();
        // build the grid view-controller and insert it into the stack
        var gv = new spaceship.game.GridView(args);
        this._stackWidget.addChild(gv);
        // create the grid audio display
        var ga = new spaceship.game.GridAudio(args);        
        // create a status model and replace the game model in the bag
        args.model = new spaceship.game.StatusModel(args);
        // create the status view pane and insert it into the stack
        var sv = new spaceship.game.StatusView(args);
        this._stackWidget.addChild(sv);
        // create the status audio display
        var sa = new spaceship.game.StatusAudio(args);
        // start the game loop
        this._gameModel.run();
    },
    
    quitGame: function() {
        // throw away the last panel to prevent errors reactivating
        this._lastPanel = null;
        // destroy the game model which should notify all the views
        this._gameModel.destroyRecursive();
        // clean up references
        this._gameModel = null;
        // show the logo again
        dojo.byId('logo').style.display = '';
        // reflow the border layout
        this._layoutWidget.resize();
        // show the main menu immediately
        dojo.publish(spaceship.SHOW_MAIN_MENU_TOPIC)
    }
});

dojo.addOnLoad(function() {
    // build the singleton controller on first page load
    var s = new spaceship.Main();
});