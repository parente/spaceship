/**
 * Game configuration singleton for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.GameConfig');
dojo.require('dojo.i18n');
dojo.requireLocalization('spaceship', 'labels');

spaceship.game.GameConfig = (function(){
    var labels = dojo.i18n.getLocalization('spaceship', 'labels');
    return [
        {
            level : 'easy',
            label: labels.EASY_LEVEL,
            initialAmmo : 3,
            initialShields : 5,
            initialShips : 10,
            rows : 6,
            columns: 6,
            tiles : [
                {category : 'BAD_TILES', cumProb : 0.2},
                {category : 'NEUTRAL_TILES', cumProb : 0.6},
                {category : 'GOOD_TILES', cumProb : 1.0}
            ],
            minigames: [
                {category : 'GOOD_OUTCOMES', cumProb: 0.6},
                {category : 'BAD_OUTCOMES', cumProb: 1.0},
            ],
            maxBonusTileValue: 4,
            maxHazardTileValue: 2,
            requiredMinigames: 3,
            matchit : {
                goalSize : 3,
                timeLimit : 60
            }
        },
        
        {
            level : 'medium',
            label: labels.MEDIUM_LEVEL,
            initialAmmo : 3,
            initialShields : 5,
            initialShips : 15,
            rows : 9,
            columns: 9,
            tiles : [
                {category : 'BAD_TILES', cumProb : 0.25},
                {category : 'NEUTRAL_TILES', cumProb : 0.75},
                {category : 'GOOD_TILES', cumProb : 1.0}
            ],
            minigames: [
                {category : 'GOOD_OUTCOMES', cumProb: 0.5},
                {category : 'BAD_OUTCOMES', cumProb: 1.0},
            ],
            maxBonusTileValue: 3,
            maxHazardTileValue: 3,
            requiredMinigames: 4,
            matchit : {
                goalSize : 4,
                timeLimit : 30
            }
        },

        {
            level : 'hard',
            label: labels.HARD_LEVEL,
            initialAmmo : 1,
            initialShields : 5,
            initialShips : 20,
            rows : 10,
            columns: 10,
            tiles : [
                {category : 'BAD_TILES', cumProb : 0.3},
                {category : 'NEUTRAL_TILES', cumProb : 0.8},
                {category : 'GOOD_TILES', cumProb : 1.0}
            ],
            minigames: [
                {category : 'GOOD_OUTCOMES', cumProb: 0.5},
                {category : 'BAD_OUTCOMES', cumProb: 1.0},
            ],
            maxBonusTileValue: 3,
            maxHazardTileValue: 4,
            requiredMinigames: 5,
            matchit : {
                goalSize : 5,
                timeLimit : 15
            }
        }
    ];
})();