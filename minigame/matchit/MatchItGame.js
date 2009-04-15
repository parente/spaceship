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

dojo.declare('spaceship.minigame.matchit.MatchItGame', spaceship.minigame.MiniGame, {
    // available content types
    games: ['states', 'animals', 'numbers', 'colors', 'sports'],
    // template html for match game
    templatePath: dojo.moduleUrl('spaceship.minigame.matchit', 'MatchItGame.html'),
    // template css for match game
    templateCSSPath: dojo.moduleUrl('spaceship.minigame.matchit', 'MatchItGame.css'),
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
    },
    
    postCreate: function() {
        // pick a random game
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
    
    onStart: function() {
        // say listen prompt
        this.say(this.gamePrompts.LISTEN_PROMPT);
        var def;
        var tds = dojo.query('td', this.patternRow);
        // start all cells hidden
        tds.style('visibility', 'hidden');
        dojo.forEach(this._goal, function(target, index) {
            // say part of goal
            var def = this.say(target.speech);
            // show part of goal as it starts speaking
            def.addCallback(dojo.hitch(this, function() {
                tds[index].innerHTML = target.visual;
                dojo.style(tds[index], 'visibility', '');
            }));
        }, this);
        // say controls prompt
        def = this.say(this.prompts.PLAY_PROMPT);
        // show controls prompt as it starts speaking
        def.addCallback(dojo.hitch(this, function() {
            dojo.style(this.helpNode, 'visibility', '');
        }));
        // get a callback at the end of the last utterance
        def = this.afterAudio();
        def.addCallback(dojo.hitch(this, function() {
            // enable user controls
            this._frozen = false;
            // hide the goal
            tds.style('visibility', 'hidden');
            // start a new timer or resume an existing one
            if(this._loseTimer) {
                this._loseTimer.resume();
            } else {
                // difficulty affects timer duration
                this._loseTimer = this.startTimer(this.config.timeLimit);
            }
        }));
    },
    
    onTimer: function(timer) {
        if(timer == this._loseTimer) {
            this._frozen = true;
            // lose the game if time runs out
            this.lose();
        }
    },
    
    onEnd: function() {
        // stop the timer
        if(this._loseTimer) {
            this._loseTimer.stop();
        }
    },
    
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
    
    onResume: function() {
        // repeat instructions from the start
        this.onStart();
    },
    
    onKeyPress: function(event) {
        if(this._frozen) return;
        var i = this._inputMap.indexOf(event.charOrCode);
        // not valid input
        if(i < 0) return;
        var input = this._values[i];
        if(this._currentInput.length == this._goal.length) {
            // rotate off the oldest input
            this._currentInput.shift();
        }
        // insert the new input
        this._currentInput.push(input);
        // render the input and check for a win
        this._reportInput(input);
    },
    
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
    
    _reportInput: function(input) {
        // clear the last win check
        if(this._lastDef) {
            this._lastDef.cancel();
        }
        // show the visuals
        dojo.query('td', this.patternRow).forEach(function(td, index) {
            var value = this._currentInput[index];
            if(value == undefined) {
                // clear out old value
                td.innerHTML = '';
            } else {
                // show the cell value
                td.innerHTML = value.visual;
            }
            // make sure the cell is visible
            dojo.style(td, 'visibility', '');
        }, this);
        // say the most recent addition
        this.say(input.speech);
        // check for a win immediately
        var win = dojo.every(this._goal, function(item, index) {
            var input = this._currentInput[index];
            if(!input) return false;
            return input.visual == item.visual;
        }, this);
        if(win) { 
            // don't allow the user to pause or do anything else right now
            this._frozen = true;
            this._loseTimer.pause();
        }
        // wait for all audio to stop before we decide to win or not
        this._lastDef = this.afterAudio();
        this._lastDef.addCallback(dojo.hitch(this, function() {
            if(win) this.win();            
        }));
    }
});