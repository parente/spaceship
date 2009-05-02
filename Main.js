/**
 * Startup code for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.Main');
dojo.require('spaceship.utils.LoaderOverlay');

// sent by the main loop after the main menu shows
spaceship.START_MAIN_MENU_TOPIC = 'ss-startMainMenu';

dojo.declare('spaceship.Main', null, {
    /**
     * Shows a loading overlay. Imports all required modules.
     */
    constructor: function() {
        // show the loading overlay immediately
        this._overlayNode = spaceship.utils.LoaderOverlay.show();

        // require modules now
        dojo.require('dojo.i18n');
        dojo.require("dijit.layout.StackContainer");
        dojo.require("dijit.layout.ContentPane");
        dojo.require("dijit.layout.BorderContainer");
        dojo.require('spaceship.sounds.AudioManager');
        dojo.require('spaceship.sounds.Jukebox');
        dojo.require('spaceship.images.GraphicsManager');
        dojo.require('spaceship.game.GameConfig');
        dojo.require('spaceship.game.GameModel');
        dojo.require('spaceship.game.GridView');
        dojo.require('spaceship.game.GridAudio');
        dojo.require('spaceship.menu.MenuModel');
        dojo.require('spaceship.menu.MenuView');
        dojo.require('spaceship.menu.MenuAudio');
        dojo.require('spaceship.menu.MenuTopics');
        dojo.require('spaceship.menu.options.OptionsMenuModel');
        dojo.require('spaceship.menu.options.OptionsMenuView');
        dojo.require('spaceship.menu.options.OptionsMenuAudio');
        dojo.require('spaceship.game.StatusModel')
        dojo.require('spaceship.game.StatusView')
        dojo.require('spaceship.game.StatusAudio');
        dojo.require('spaceship.html.HtmlModel')
        dojo.require('spaceship.html.HtmlView')
        dojo.require('spaceship.html.HtmlAudio');
        dojo.require('spaceship.game.HUDView');
        dojo.require('spaceship.game.HUDAudio');
        dojo.require('spaceship.minigame.MiniGameManager');
        dojo.require("dojo.parser");
        dojo.requireLocalization('spaceship', 'labels');
        
        // bundle of locale strings
        this._labels = dojo.i18n.getLocalization('spaceship', 'labels');
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
        // error dialog reference
        this._errorDialog

        // register for when the page unloads
        dojo.addOnUnload(dojo.hitch(this, this.uninitialize));        
        // register for when all modules load
        var readyFunc = dojo.hitch(this, 'onLibReady');
        var missingFunc = dojo.hitch(this, 'onMissingAudio');
        dojo.addOnLoad(readyFunc);
        // register for when audio is ready
        var def = spaceship.sounds.AudioManager.startup();
        def.addCallback(readyFunc).addErrback(missingFunc);
        // register for when images are ready
        spaceship.images.GraphicsManager.startup().addCallback(readyFunc);
    },
    
    
    /**
     * Called when all libraries are loaded. Initializes the game.
     */
    onLibReady: function() {
        ++this._readyCount;
        if(this._readyCount == 3) {
            this.initialize();
        }
    },
    
    /** 
     * Called when audio fails to initialize. Shows a dialog instructing the
     * user to download Outfox.
     */
    onMissingAudio: function() {
        dojo.require("dijit.Dialog");
        var args = {
            href : 'html/audio.html',
            title : this._labels.MISSING_REQ_TITLE,
            draggable : false
        };
        this._errorDialog = new dijit.Dialog(args);
        // don't allow the dialog to hide
        this._errorDialog.hide = function() {};
        this._errorDialog.show();
    },
    
    /**
     * Unsubscribe from all dojo.publish topics.
     */
    uninitialize: function() {
        for(var key in this._subs) {
            dojo.unsubscribe(this._subs[key]);
        }
    },
    
    /**
     * Creates all of the necessary game framework objects. 
     * Hides the loading overlay.
     */
    initialize: function() {
        // parse the inline page widgets
        dojo.parser.parse();
        
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
            itemLabels: [this._labels.NEW_GAME_ITEM, this._labels.OPTIONS_ITEM, 
                         this._labels.NEWS_ITEM, this._labels.CREDITS_ITEM, 
                         this._labels.HELP_ITEM]
        };
        this._returnArgs = {
            itemLabels: [this._labels.RESUME_GAME_ITEM, 
                         this._labels.OPTIONS_ITEM, this._labels.QUIT_GAME_ITEM],
            cancelable: true
        };
        this._difficultyArgs = {
            itemLabels: dojo.map(spaceship.game.GameConfig, function(cfg) {
                return cfg.label;
            }),
            title: this._labels.DIFFICULTY_TITLE,
            cancelable: true
        };
        this._quitArgs = {
            itemLabels: [this._labels.NO_QUIT_ITEM, 
                         this._labels.YES_QUIT_ITEM],
            title: this._labels.QUIT_TITLE,
            cancelable: true
        };
        
        // build a jukebox for music
        this._jukebox = new spaceship.sounds.Jukebox();
        
        // start listening for menu related events
        this._subs['pause-game'] = dojo.subscribe(
            spaceship.game.PAUSE_GAME_TOPIC, dojo.hitch(this, 'pauseGame'));
        this._subs['pause-minigame'] = dojo.subscribe(
            spaceship.game.PAUSE_MINIGAME_TOPIC, dojo.hitch(this, 'pauseGame'));
        this._subs['end-game'] = dojo.subscribe(
            spaceship.game.END_GAME_TOPIC, dojo.hitch(this, 'quitGame'));
        // show the main menu immediately
        this.startMain();
        // hide the busy overlay
        spaceship.utils.LoaderOverlay.hide(this._overlayNode);
        this._overlayNode = null;
    },
    
    /**
     * Called when the browser resizes. Adjusts the watermark background size.
     */
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

    /**
     * Called in response to CHOOSE_ITEM_TOPIC from the main menu.
     */
    onChooseMain: function(index, label) {
        switch(label) {
        case this._labels.NEW_GAME_ITEM:
            // destroy the menu immediately
            this._endMenu(false);
            // pick a difficulty
            this._startMenu(this._difficultyArgs, 'onChooseDifficulty',
                'startMain');
            break;
        case this._labels.OPTIONS_ITEM:
            // destroy the menu immediately
            this._endMenu(false);
            this._startOptions('startMain');
            break;
        case this._labels.NEWS_ITEM:
            // show the main game news, but leave the main menu
            this._startHtml('html/news.html');
            break;        
        case this._labels.CREDITS_ITEM:
            // show the main game credits, but leave the main menu
            this._startHtml('html/credits.html');
            break;
        case this._labels.HELP_ITEM:
            // show the main game help, but leave the main menu
            this._startHtml('html/help.html');
            break;
        }
    },

    /**
     * Called in response to CHOOSE_ITEM_TOPIC from the return menu.
     */
    onChooseReturn: function(index, label) {
        switch(label) {
        case this._labels.OPTIONS_ITEM:
            // destroy the menu immediately
            this._endMenu(false);
            this._startOptions('pauseGame');
            break;
        case this._labels.RESUME_GAME_ITEM:
            this.resumeGame();
            break;            
        case this._labels.QUIT_GAME_ITEM:
            // destroy the menu immediately
            this._endMenu(false);
            // make sure we want to quit the current game
            this._startMenu(this._quitArgs, 'onChooseQuit', 'pauseGame');
            break;
        }   
    },
    
    /**
     * Called in response to CHOOSE_ITEM_TOPIC from the difficulty menu.
     */
    onChooseDifficulty: function(index, label) {
        // destroy the menu immediately
        this._endMenu(false);
        for(var i=0; i < spaceship.game.GameConfig.length; i++) {
            var config = spaceship.game.GameConfig[i];
            if(config.label == label) {
                this._config = config;
                break;
            }
        }
        this.startGame();
    },
    
    /**
     * Called in response to CHOOSE_ITEM_TOPIC from the confirm quit menu.
     */
    onChooseQuit: function(index, label) {
        // destroy the menu immediately
        this._endMenu(false);
        if(label == this._labels.YES_QUIT_ITEM) {
            // throw away the last panel to prevent errors reactivating
            this._lastPanel = null;
            // destroy the game model which should notify all the views
            this._gameModel.destroyRecursive();
        } else {
            // restart the resume menu
            this._startMenu(this._returnArgs, 'onChooseReturn', 'resumeGame');
        }
    },

    /**
     * Start a HTML panel.
     *
     * @param url URL of the HTML doc to show
     */
    _startHtml: function(url) {
        // store the last active panel
        if(!this._lastPanel) {
            this._lastPanel = this._stackWidget.selectedChildWidget;
        }
        
        // create the html model and add it to the bag
        var model = new spaceship.html.HtmlModel({url : url});
        var args = {model: model};
        var view = new spaceship.html.HtmlView(args);
        var audio = new spaceship.html.HtmlAudio(args);
        // add the visual view to the stack
        this._stackWidget.addChild(view);
        this._stackWidget.selectChild(view);
    },
    
    /**
     * Ends a HTML panel.
     */
    _endHtml: function() {
        // show the last active panel
        if(this._lastPanel) {
            this._stackWidget.selectChild(this._lastPanel);
            this._lastPanel = null;
        }
    },
    
    /**
     * Start the options panel.
     * 
     * @param end String name of method to handle cancel
     */
    _startOptions: function(end) {
        // store the last active panel
        if(!this._lastPanel) {
            this._lastPanel = this._stackWidget.selectedChildWidget;
        }
        
        // let the menu options drive this controller
        this._subs['menu-choose'] = dojo.subscribe(spaceship.menu.CHOOSE_ITEM_TOPIC, 
            this, end);
        this._subs['menu-cancel'] = dojo.subscribe(spaceship.menu.CANCEL_MENU_TOPIC, 
            this, end);
        
        // create the html model and add it to the bag
        this._menuModel = new spaceship.menu.options.OptionsMenuModel();
        var args = {model: this._menuModel};
        var view = new spaceship.menu.options.OptionsMenuView(args);
        var audio = new spaceship.menu.options.OptionsMenuAudio(args);
        // add the visual view to the stack
        this._stackWidget.addChild(view);
        this._stackWidget.selectChild(view);
    },
    
    /**
     * Starts a new menu.
     * 
     * @param args Arguments to pass to the menu MVC components
     * @param choose String name of method to handle item choice
     * @param cancel String name of method to handle menu cancel
     */
    _startMenu: function(args, choose, cancel) {
        // store the last active panel
        if(!this._lastPanel) {
            this._lastPanel = this._stackWidget.selectedChildWidget;
        }
        
        // let the menu options drive this controller
        this._subs['menu-choose'] = dojo.subscribe(spaceship.menu.CHOOSE_ITEM_TOPIC, 
            this, choose);
        if(cancel) {
            this._subs['menu-cancel'] = dojo.subscribe(
                spaceship.menu.CANCEL_MENU_TOPIC, this, cancel);
        }
        
        // create the menu model and add it to the bag
        this._menuModel = new spaceship.menu.MenuModel(args);
        var vargs = {model: this._menuModel, interrupt: cancel == 'resumeGame'};
        var mv = new spaceship.menu.MenuView(vargs);
        var ma = new spaceship.menu.MenuAudio(vargs);
        this._stackWidget.addChild(mv);
        this._stackWidget.selectChild(mv);
    },
    
    /**
     * Ends a menu by destroying the menu model.
     *
     * @param restore True to show previous active panel
     */
    _endMenu: function(restore) {
        // show the last active panel
        if(restore && this._lastPanel) {
            this._stackWidget.selectChild(this._lastPanel);
            this._lastPanel = null;
        }
        if(this._menuModel) {
            // destroy the menu
            this._menuModel.destroyRecursive();
            this._menuModel = null;
            dojo.unsubscribe(this._subs['menu-choose']);
            dojo.unsubscribe(this._subs['menu-cancel']);
            delete this._subs['menu-choose'];
            delete this._subs['menu-cancel'];
        }
    },
    
    /**
     * Starts the main menu.
     */
    startMain: function() {
        // destroy any existing menu
        this._endMenu(false);
        // indicate title screen started
        dojo.publish(spaceship.START_MAIN_MENU_TOPIC);
        this._startMenu(this._mainArgs, 'onChooseMain');
        // ignore any possible last panel when starting the main menu;
        // it could be leftover from an old game
        this._lastPanel = null;
    },
     
    /**
     * Starts a new game.
     */
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
        var ha = new spaceship.game.HUDAudio(args);
        // hide the logo
        dojo.byId('logo').style.display = 'none';
        // reflow the border layout widget
        this._layoutWidget.resize();
        // create the minigame manager and insert it into the stack
        var mgm = new spaceship.minigame.MiniGameManager(args);
        this._stackWidget.addChild(mgm);      
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
    
    /**
     * Pauses a game. Shows the pause menu.
     *
     * @param resumeTopic Topic to publish when resuming game
     */
    pauseGame: function(resumeTopic) {
        // destroy any existing menu
        this._endMenu(false);
        // store resume topic
        if(resumeTopic) { 
            this._resumeTopic = resumeTopic;
        }
        this._startMenu(this._returnArgs, 'onChooseReturn', 'resumeGame');
    },
    
    /**
     * Resumes a game
     */
    resumeGame: function() {
        // destroy any existing menu
        this._endMenu(true);
        dojo.publish(this._resumeTopic);
        this._resumeTopic = null;
    },
    
    /**
     * Ends a game by destroying the game model and returning to the main menu.
     */
    quitGame: function() {
        // clean up references
        this._gameModel = null;
        // show the logo again
        dojo.byId('logo').style.display = '';
        // reflow the border layout
        this._layoutWidget.resize();
        // show the main menu immediately
        this.startMain();
    }
});

dojo.addOnLoad(function() {
    // build the singleton controller on first page load
    var s = new spaceship.Main();
});