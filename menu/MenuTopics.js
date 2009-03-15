/**
 * Menu model pub/sub topics for the Spaceship! game.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.menu.MenuTopics');

// sent by a menu when the user targets an item
spaceship.menu.SELECT_ITEM_TOPIC = 'ss-selectItem';
// sent by a menu when the user chooses an item to end the menu
spaceship.menu.CHOOSE_ITEM_TOPIC = 'ss-chooseItem';
// sent by a menu when the user cancels the menu without choosing an item
spaceship.menu.CANCEL_MENU_TOPIC = 'ss-cancelMenu';
// sent by a menu when the menu ends
spaceship.menu.END_MENU_TOPIC = 'ss-endMenu';