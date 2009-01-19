/**
 * Game model pub/sub topics for the Spaceship! game.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.GameTopics');

spaceship.game.START_GAME_TOPIC = 'ss-startGame';
spaceship.game.SHOW_STATUS_TOPIC = 'ss-showStatus';
spaceship.game.PREPARE_SHOT_TOPIC = 'ss-targetShot';
spaceship.game.LAND_SHOT_TOPIC = 'ss-landShot';
spaceship.game.PLAY_MINIGAME_TOPIC = 'ss-playMinigame';
spaceship.game.UNTARGET_TILE_TOPIC = 'ss-untargetTile';
spaceship.game.TARGET_TILE_TOPIC = 'ss-targetTile';
spaceship.game.CHANGE_AMMO_TOPIC = 'ss-changeAmmo';
spaceship.game.CHANGE_SHIELDS_TOPIC = 'ss-changeShield';
spaceship.game.HIT_SHIP_TOPIC = 'ss-hitShip';
spaceship.game.MISS_SHIP_TOPIC = 'ss-missShip';
spaceship.game.HINT_TOPIC = 'ss-getHint';
spaceship.game.WARP_TOPIC = 'ss-warpTime';
spaceship.game.END_GAME_TOPIC = 'ss-EndGame';
spaceship.game.START_MINIGAME_TOPIC = 'ss-startMinigame';
spaceship.game.END_MINIGAME_TOPIC = 'ss-endMinigame';