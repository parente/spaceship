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
        var goal = [];
        if(this.gamePrompts.SPEECH_CHOICES) {
            goal = goal.concat(this.gamePrompts.SPEECH_CHOICES);
        }
        if(this.gamePrompts.SOUND_CHOICES) {
            goal = goal.concat(this.gamePrompts.SOUND_CHOICES);
        }
        // @todo: number should be based on difficulty
        this.goal = this.pickRandomN(goal, 4);
    },
    
    onStart: function() {
        // show goal and prompt tiles
        dojo.forEach(this.goal, function(target) {
            var td = dojo.doc.createElement('td');
            td.textContent = target;
            this.goalRow.appendChild(td);
        }, this);
        // speak initial prompts and goal
        
    },
    
    onEnd: function() {
        console.debug('onEnd');    
    },
    
    onPause: function() {
        console.debug('onPause');        
    },
    
    onResume: function() {
        console.debug('onResume');
    },
    
    onKeyPress: function(event) {
        console.debug('onKeyPress', event.charOrCode);
        switch(event.charOrCode) {
            case dojo.keys.ENTER:
                this.win();
                break;
            case 'x':
                this.lose();
                break;
        }
    }
});