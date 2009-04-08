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
        // random assignment of arrows to goal indicies
        this._arrows = [];
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
        // say nothing, but do it so we can get a callback at the end of the
        // last utterance
        def = this.say(' ');
        def.addCallback(dojo.hitch(this, function() {
            // enable user controls
            this._frozen = false;
            // hide the goal
            tds.style('visibility', 'hidden');
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
        console.debug('onKeyPress', event.charOrCode);
        switch(event.charOrCode) {
            case dojo.keys.UP_ARROW:
                break;
            case dojo.keys.DOWN_ARROW:
                break;
            case dojo.keys.LEFT_ARROW:
                break;
            case dojo.keys.RIGHT_ARROW:
                break;
        }
    }
});