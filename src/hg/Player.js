// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @classdesc Serializable container for data pertaining to a single user.
 * @class HungryGames~Player
 *
 * @param {string} id The id of the user this object is representing.
 * @param {string} username The name of the user to show in the game.
 * @param {string} avatarURL URL to avatar to show for the user in the game.
 * @param {?string} [nickname=null] The nickname for this user usually
 * assigned by the guild. If the user does not have a nickname, this will have
 * the same value as `name`.
 * @property {string} id The id of the User this Player represents.
 * @property {string} name The name of this Player.
 * @property {string} avatarURL The URL to the discord avatar of the User.
 * @property {string} nickname The nickname for this user usually assigned by
 * the guild. If the user does not have a nickname, this will have the same
 * value as `name`.
 * @property {boolean} living Is the player still alive.
 * @property {number} bleeding How many days has the player been wounded.
 * @property {number} rank The current rank of the player in the game.
 * @property {string} state The current player state (normal, wounded, dead,
 * zombie).
 * @property {number} kills The number of players this player has caused to
 * die.
 * @property {Object.<number>} weapons The weapons the player currently has
 * and how many of each.
 * @property {Object} settings Custom settings for this user associated with
 * the games.
 * @property {number} dayOfDeath The day at which the player last died in the
 * game. Only a valid number if the player is currently dead. Otherwise a
 * garbage value will be available.
 */
function Player(id, username, avatarURL, nickname = null) {
  // Replace backtick with Unicode 1FEF Greek Varia because it looks the same,
  // but it wont ruin formatting.
  username = username.replaceAll('`', '`');
  if (typeof nickname === 'string') nickname = nickname.replaceAll('`', '`');
  // User id.
  this.id = id;
  // Username.
  this.name = username;
  // URL TO user's current avatar.
  this.avatarURL = avatarURL;
  // Nickname for this user.
  this.nickname = nickname || username;
  // If this user is still alive.
  this.living = true;
  // How many days the players has been wounded.
  this.bleeding = 0;
  // The rank at which this user died.
  this.rank = 1;
  // Health state.
  this.state = 'normal';
  // Number of kills this user has for the game.
  this.kills = 0;
  // Map of the weapons this user currently has, and how many of each.
  this.weapons = {};
  // Custom settings for the games associated with this player.
  this.settings = {};
  // The day when the player died.
  this.dayOfDeath = -1;
}

/**
 * Create a Player from a given Discord.User.
 *
 * @private
 * @param {Discord~User|Discord~GuildMember} member User or GuildMember to
 * make a Player from.
 * @return {HungryGames~Player} Player object created from User.
 */
Player.from = function(member) {
  const user = member.user || member;
  return new Player(
      user.id, user.username, user.displayAvatarURL({format: 'png'}),
      member.nickname);
};

module.exports = Player;