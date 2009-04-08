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
    games: ['colors', 'numbers'],
    // template html for match game
    templatePath: dojo.moduleUrl('spaceship.minigame.matchit', 'MatchItGame.html'),
    // template css for match game
    templateCSSPath: dojo.moduleUrl('spaceship.minigame.matchit', 'MatchItGame.css'),
    postMixInProperties: function() {
        // goal of the current match game
        this._goal = null;
        // user can give input now?
        this._frozen = true;
        // random assignment of inputs to goal indices
        this._inputMap = [dojo.keys.UP_ARROW, dojo.keys.DOWN_ARROW, 
            dojo.keys.LEFT_ARROW, dojo.keys.RIGHT_ARROW];
        this.shuffleRandom(this._inputMap);        
        // current user input to match against the goal
        this._currentInput = [];
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
        // pick random choices, up to 4 unique to map to arrows
        this._goal = this.pickRandomN(this.gamePrompts.CHOICES, 4);
        // @todo: difficulty should affect number of slots
        // build slots for the values now
        dojo.forEach(this._goal, function(target) {
            var td = dojo.doc.createElement('td');
            td.innerHTML = target.visual;
            dojo.style(td, 'visibility', 'hidden');
            this.patternRow.appendChild(td);
        }, this);
    },
    
    onStart: function() {
        // say listen prompt
        this.say(this.gamePrompts.LISTEN_PROMPT);
        var def;
        var tds = dojo.query('td', this.patternRow);
        dojo.forEach(this._goal, function(target, index) {
            // say part of goal
            var def = this.say(target.speech);
            // show part of goal as it starts speaking
            def.addCallback(dojo.hitch(this, function() {
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
            // @todo: set a timer until the user loses
        }));
    },
    
    onEnd: function() {
        console.debug('onEnd');    
    },
    
    onPause: function() {
        this._frozen = true;
    },
    
    onResume: function() {
        console.debug('onResume');
        this._frozen = false;
    },
    
    onKeyPress: function(event) {
        if(this._frozen) return;
        var i = this._inputMap.indexOf(event.charOrCode);
        var input = this._goal[i];
        if(this._currentInput.length == this._goal.length) {
            // rotate off the oldest input
            this._currentInput.shift();
        }
        // insert the new input
        this._currentInput.push(input);
        // render the input and check for a win
        this._reportInput(input);
    },
    
    _reportInput: function(input) {
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
        // check for a win after the report
        var def = this.afterAudio();
        def.addCallback(dojo.hitch(this, function() {
            var win = dojo.every(this._goal, function(item, index) {
                return this._currentInput[index.visual] == item.visual;
            });
            if(win) this.win();
            // @todo: little more fanfare please if won
        }));
    }
});