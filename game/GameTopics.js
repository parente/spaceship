/**
 * Game model pub/sub topics for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.game.GameTopics');

// main game loop topics
// sent by GameModel before it enters the main game loop
spaceship.game.START_GAME_TOPIC = 'ss-startGame';
// sent by the GameModel when the game status should be reported
spaceship.game.SHOW_STATUS_TOPIC = 'ss-showStatus';
// sent by the GameModel when the user should aim a shot
spaceship.game.PREPARE_SHOT_TOPIC = 'ss-targetShot';
// sent by the GameModel when the user should play a series of minigames
spaceship.game.START_MINIGAME_SERIES_TOPIC = 'ss-startMinigameSeries';
// sent by the GameModel when the user should play a minigame
spaceship.game.PLAY_MINIGAME_TOPIC = 'ss-playMinigame';
// sent by the GameModel when the user stop playing a series of minigames
spaceship.game.END_MINIGAME_SERIES_TOPIC = 'ss-endMinigameSeries';
// sent by the GameModel after the game is over
spaceship.game.END_GAME_TOPIC = 'ss-endGame';
// sent by the GameModel before the game is interrupted by a menu
spaceship.game.PAUSE_GAME_TOPIC = 'ss-pauseGame';
// sent by the GameModel before the game resumes after a menu
spaceship.game.RESUME_GAME_TOPIC = 'ss-resumeGame';
// sent by the GameModel before the game ends in a win
spaceship.game.WIN_GAME_TOPIC = 'ss-winGame';
// sent by the GameModel before the game ends in a loss
spaceship.game.LOSE_GAME_TOPIC = 'ss-loseGame';

// tile topics
// sent by a Tile when a user shot reveals it
spaceship.game.LAND_SHOT_TOPIC = 'ss-landShot';
// sent by a Tile when the user aims at it
spaceship.game.TARGET_TILE_TOPIC = 'ss-targetTile';
// sent by a Tile when the user stops aiming at it
spaceship.game.UNTARGET_TILE_TOPIC = 'ss-untargetTile';
// sent by the GridView when it cannot target a tile
spaceship.game.BAD_TARGET_TOPIC = 'ss-badTarget';

// reward and hazard topics
// sent by a Tile when hit to reward or steal ammo
spaceship.game.CHANGE_AMMO_TOPIC = 'ss-changeAmmo';
// sent by a Tile when hit to reward or steal shields
spaceship.game.CHANGE_SHIELDS_TOPIC = 'ss-changeShield';
// sent by a Tile when a shot hits an enemy
spaceship.game.HIT_SHIP_TOPIC = 'ss-hitShip';
// sent by a Tile when a shot misses
spaceship.game.MISS_SHIP_TOPIC = 'ss-missShip';
// sent by a Tile when hit to reward with a hint
spaceship.game.HINT_TOPIC = 'ss-getHint';
// sent by a Tile when hit to send enemy reinforcements
spaceship.game.WARP_TOPIC = 'ss-warpTime';

// mini game topics
// sent by MiniGameManager before it starts a minigame
spaceship.game.START_MINIGAME_TOPIC = 'ss-startMinigame';
// sent by MiniGameManager after it ends a minigame
spaceship.game.END_MINIGAME_TOPIC = 'ss-endMinigame';
// sent by MiniGameManager before a minigame is interrupted by a menu
spaceship.game.PAUSE_MINIGAME_TOPIC = 'ss-pauseMinigame';
// sent by MiniGameManager before a minigame resumes after a menu
spaceship.game.RESUME_MINIGAME_TOPIC = 'ss-resumeMinigame';
// sent by MiniGame when it ends in a win
spaceship.game.WIN_MINIGAME_TOPIC = 'ss-winMinigame';
// sent by MiniGame when it ends in a loss
spaceship.game.LOSE_MINIGAME_TOPIC = 'ss-loseMinigame';