dojo.provide('spaceship.minigame.matchit.MatchItGame');
dojo.require('spaceship.minigame.MiniGame');

dojo.declare('spaceship.minigame.matchit.MatchItGame', spaceship.minigame.MiniGame, {
    templateString: '<div>Match It</div>',
    onStart: function() {
        console.debug('onStart');
        this.say('Listen to these words.')
    },
    
    uninitialize: function() {
        // destroyed
        console.debug('destroyed');
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
        console.debug('onKeyPress', event);
        switch(event.keyCode) {
            case dojo.keys.ENTER:
                this.win();
                break;
            case 'x':
                this.lose();
                break;
        }
    }
});