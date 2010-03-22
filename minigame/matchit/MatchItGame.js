/**
 * MatchIt minigame for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.minigame.matchit.MatchItGame');
dojo.require('spaceship.minigame.MiniGame');
dojo.require('dojo.i18n');
dojo.requireLocalization('spaceship.minigame.matchit', 'prompts');

// true if we've already given the repeat help prompt 
spaceship.minigame.matchit._repeatPrompted = false;

dojo.declare('spaceship.minigame.matchit.MatchItGame', spaceship.minigame.MiniGame, {
    // available content types
    games: ['solfege', 'states', 'animals', 'numbers', 'colors', 'sports'],
    // template html for match game
    templatePath: dojo.moduleUrl('spaceship.minigame.matchit', 'MatchItGame.html'),
    // template css for match game
    templateCSSPath: dojo.moduleUrl('spaceship.minigame.matchit', 'MatchItGame.css'),
    
    /**
     * Called after widget construction. Initializes instance variables.
     */
    postMixInProperties: function() {
        // possible goal/input values
        this._values = null;
        // goal of the current match game
        this._goal = null;
        // user can give input now?
        this._frozen = true;
        // random assignment of inputs to goal indices
        this._inputMap = [dojo.keys.UP_ARROW, dojo.keys.DOWN_ARROW, 
            dojo.keys.LEFT_ARROW, dojo.keys.RIGHT_ARROW];
        this.shuffleRandom(this._inputMap);
        // bundle of paths for visual, speech, sound templates
        this._templateBundle = {
            images : dojo.moduleUrl('spaceship.minigame.matchit.images'),
            sounds : dojo.moduleUrl('spaceship.minigame.matchit.sounds')
        };
        // current user input to match against the goal
        this._currentInput = [];
        // time until the user loses this minigame
        this._loseTimer = null;
        // last audio deferred callback
        this._lastDef = null;
        // need to call the parent for stylesheet loading
        this.inherited(arguments);
        // load strings
        this.prompts = dojo.i18n.getLocalization('spaceship.minigame.matchit', 'prompts');
        // don't keep giving repeat help if the user has seen/heard it before
        if(spaceship.minigame.matchit._repeatPrompted) {
            this.prompts.PLAY_PROMPT = this.prompts.PLAY_PROMPT_N;
        }
    },
    
    /**
     * Called after widget insertion into the DOM. Picks values for this
     * minigame instance.
     */
    postCreate: function() {
        // pick a random set of things to match from the available games list
        var name = this.pickRandom(this.games);
        // load game resources
        dojo.requireLocalization('spaceship.minigame.matchit', name);
        this.gamePrompts = dojo.i18n.getLocalization('spaceship.minigame.matchit', name);
        // pick random choices
        this._values = this.pickRandomN(this.gamePrompts.CHOICES, 
            this._inputMap.length);
        dojo.forEach(this._values, this._fillTemplates, this);
        // now make series length based on difficulty
        this._goal = this.pickRandomN(this._values, this.config.goalSize);
        dojo.forEach(this._goal, function(item) {
            // build cells for display
            var td = dojo.doc.createElement('td');
            td.style.width = (1.0 / this._goal.length) * 100 + '%';
            this.patternRow.appendChild(td);
        }, this);
    },
    
    /**
     * Called when the minigame should start. Speaks and shows the listen 
     * prompt, then speaks/plays/shows the goal the player should match, then 
     * gives short or long instructions about how to use the keyboard to play.
     * Allows the user to start playing only after all prompts have finished.
     * Starts the game timer at that point too with a duration based on 
     * difficulty.
     */
    onStart: function() {
        // reset input
        this._currentInput = [];
        // say listen prompt
        this.say(this.gamePrompts.LISTEN_PROMPT);
        var def;
        var tds = dojo.query('td', this.patternRow);
        // start all cells hidden
        tds.style('visibility', 'hidden');
        dojo.forEach(this._goal, function(target, index) {
            // say part of goal
            if(target.sound) {
                def = this.play(target.sound);
            } else {
                def = this.say(target.speech);
            }
            // show part of goal as it starts speaking
            def.callBefore(dojo.hitch(this, function() {
                if(target.visual) {
                    tds[index].innerHTML = target.visual;
                }
                dojo.style(tds[index], 'visibility', '');
            }));
        }, this);
        
        // say controls prompt
        def = this.say(this.prompts.PLAY_PROMPT);
        spaceship.minigame.matchit._repeatPrompted = true;
        
        // show controls prompt as it starts speaking
        def.callBefore(dojo.hitch(this, function() {
            dojo.style(this.helpNode, 'visibility', '');
        }));
        // let the user play after the final prompt
        def.callAfter(dojo.hitch(this, function() {
            // enable user controls
            this._frozen = false;
            // hide the goal
            tds.style('visibility', 'hidden');
            if(this._loseTimer) {
                // result an existing timer (coming back from pause)
                this._loseTimer.resume();
            } else {
                // start a new timer based on difficulty
                this._loseTimer = this.startTimer(this.config.timeLimit);
            }
        }));
    },
    
    /**
     * Called when a timer expires.
     *
     * @param timer spaceship.utils.Timer instance that expired
     */
    onTimer: function(timer) {
        if(timer == this._loseTimer) {
            this._frozen = true;
            // lose the game if time runs out
            this.lose();
        }
    },
    
    /**
     * Called when the minigame is over.
     */
    onEnd: function() {
        // stop the timer
        if(this._loseTimer) {
            this._loseTimer.stop();
        }
    },
    
    /**
     * Called when the user pauses the minigame.
     */
    onPause: function() {
        // pause the timer
        if(this._loseTimer) {
            this._loseTimer.pause();
        }
        // freeze input
        this._frozen = true;
        // reset user input for when we return
        this._currentInput = [];
    },
    
    /**
     * Called when the user resumes the minigame.
     */
    onResume: function() {
        // repeat instructions from the start
        this.onStart();
    },
    
    /**
     * Called when the user presses a key in the minigame.
     *
     * @param event dojo.Event
     */
    onKeyPress: function(event) {
        // abort now if not ready for user input yet
        if(this._frozen) return;
        var code = event.charCode || event.keyCode;
        
        if(code == dojo.keys.SPACE) {
            // freeze input
            this._frozen = true;
            // repeat instructions
            this.onStart();
            return;
        }
        // arrow keys map here, but nothing else
        var i = this._inputMap.indexOf(event.charOrCode);
        // not valid input
        if(i < 0) return;
        
        // insert and render the new input
        var input = this._values[i];
        this._currentInput.push(input);
        var def = this._reportInput(input);
        
        // check for a win
        var mismatch = false;
        var win = dojo.every(this._goal, function(item, index) {
            var input = this._currentInput[index];
            if(!input) {
                // at end of input, but good so far
                return false;
            } else if(input.visual != item.visual ||
                      input.speech != item.speech ||
                      item.sound != item.sound) {
                // latest value is bad, need to start over
                mismatch = true;
                return false;
            }
            return true;
        }, this);
        if(win) { 
            // don't allow the user to pause or do anything else right now
            this._frozen = true;
            this._loseTimer.pause();
        } else if(mismatch) {
            // clear out input after a bad value
            this._currentInput = [];
        }

        // wait for all audio to stop before we report the win to the minigame
        // manager
        this._lastDef = def;
        this._lastDef.callAfter(dojo.hitch(this, function() {
            if(win) this.win();
        }));
    },
    
    /**
     * Fills in item templates for sound, speech, and visuals with paths.
     *
     * @param templates Object with visual, sound, and speech templates for
     *   a game item loaded from the nls/ directory
     */
    _fillTemplates: function(templates) {
        if(templates.visual) {
            templates.visual = dojo.string.substitute(templates.visual, 
                this._templateBundle);
        }
        if(templates.sound) {
            templates.sound = dojo.string.substitute(templates.sound, 
                this._templateBundle);
        }
        if(templates.speech) {
            templates.speech = dojo.string.substitute(templates.speech, 
                this._templateBundle);
        }        
    },
    
    /**
     * Speaks, plays sound, and/or shows a graphic mapped to the arrow key
     * the user pressed. Keeps filling the visual box from left to right until
     * the user makes a mistake in the sequence. The input after the wrong
     * input resets the box and appears at the far left again.
     *
     * @param input Object with visual, sound, speech properties mapped to the
     *   key the user pressed
     */
    _reportInput: function(input) {
        // clear the last win check
        if(this._lastDef) {
            // @todo: expose via jsonic
            this._lastDef.after.cancel();
        }
        
        // show the most recent addition (really, render everything)
        dojo.query('td', this.patternRow).forEach(function(td, index) {
            var value = this._currentInput[index];
            if(value == undefined) {
                // clear out old value
                td.innerHTML = '';
            } else if(value.visual) {
                // show the cell value
                td.innerHTML = value.visual;
            }
            // make sure the cell is visible
            dojo.style(td, 'visibility', '');
        }, this);
        
        // say/play the most recent addition
        var def;
        if(input.sound) {
            def = this.play(input.sound, true);
        } else {
            def = this.say(input.speech, true);
        }
        return def;
    }
});