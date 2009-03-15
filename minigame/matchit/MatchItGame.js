dojo.provide('spaceship.minigame.matchit.MatchItGame');
dojo.require('spaceship.minigame.MiniGame');

dojo.declare('spaceship.minigame.matchit.MatchItGame', spaceship.minigame.MiniGame, {
    templateString: '<div>Match It</div>',
    onStart: function() {
        console.debug('onGameStart');
    },
    
    onKeyPress: function(event) {
        console.debug('onKeyPress', event);
    }
});