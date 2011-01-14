/**
 * Game configuration singleton for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.GameLevel');
dojo.require('dojo.i18n');
dojo.requireLocalization('spaceship', 'labels');

spaceship.game.GameLevel = (function(){
    var labels = dojo.i18n.getLocalization('spaceship', 'labels');
    return {
        easy : {
            initialAmmo : 3,
            initialShields : 5,
            initialShips : 5,
            rows : 3,
            columns: 4,
            tiles : [
                {category : 'BAD_TILES', cumProb : 0.2},
                {category : 'NEUTRAL_TILES', cumProb : 0.6},
                {category : 'GOOD_TILES', cumProb : 1.0}
            ],
            minigame : null,
            minigames: [
                {category : 'GOOD_OUTCOMES', cumProb: 0.7},
                {category : 'BAD_OUTCOMES', cumProb: 1.0},
            ],
            maxBonusTileValue: 3,
            maxHazardTileValue: 2,
            requiredMinigames: 3,
            matchit : {
                goalSize : 3,
                timeLimit : 60
            }
        },
        normal : {
            initialAmmo : 3,
            initialShields : 5,
            initialShips : 10,
            rows : 6,
            columns: 6,
            tiles : [
                {category : 'BAD_TILES', cumProb : 0.25},
                {category : 'NEUTRAL_TILES', cumProb : 0.75},
                {category : 'GOOD_TILES', cumProb : 1.0}
            ],
            minigame : null,
            minigames: [
                {category : 'GOOD_OUTCOMES', cumProb: 0.65},
                {category : 'BAD_OUTCOMES', cumProb: 1.0},
            ],
            maxBonusTileValue: 2,
            maxHazardTileValue: 3,
            requiredMinigames: 4,
            matchit : {
                goalSize : 3,
                timeLimit : 30
            }
        },
        hard : {
            initialAmmo : 1,
            initialShields : 5,
            initialShips : 20,
            rows : 10,
            columns: 10,
            tiles : [
                {category : 'BAD_TILES', cumProb : 0.4},
                {category : 'NEUTRAL_TILES', cumProb : 0.8},
                {category : 'GOOD_TILES', cumProb : 1.0}
            ],
            minigame : null,
            minigames: [
                {category : 'GOOD_OUTCOMES', cumProb: 0.5},
                {category : 'BAD_OUTCOMES', cumProb: 1.0},
            ],
            maxBonusTileValue: 2,
            maxHazardTileValue: 4,
            requiredMinigames: 5,
            matchit : {
                goalSize : 5,
                timeLimit : 15
            }
        }
    };
})();