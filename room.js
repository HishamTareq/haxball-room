/**
 * An object that contains the current players `id` as a `key` and its `value` is `conn`
 */
var connections = {};

var token = "thr1.AAAAAGPQNu4N_uq_S-RPiw.9oOzTcyHifA";
var roomName = "NAME";
var public = false;
var noPlayer = true;
var maxPlayers = 12;
/**
 * Enable and disable connection mode
 */
var CONNECTION_MODE = true;
/**
 * Enable and disable Recaptcha mode
 */
var RECAPTCHA_MODE = false;
/**
 * Enable and disable blacklist mode
 */
var BLACKLIST_MODE = true;

var room = HBInit({
  maxPlayers: maxPlayers,
  roomName: roomName,
  noPlayer: noPlayer,
  public: public,
  token: token,
});

room.setRequireRecaptcha(RECAPTCHA_MODE);

room.onPlayerJoin = function (player) {
  check({ id: player.id, conn: player.conn });
};

room.onPlayerLeave = function (player) {
  delete connections[player.id];
};

room.onPlayerChat = function (player, message) {
  
}

Object.defineProperty(connections, 'swap', {
  value: function () {
    var a = {};
    for (let key in this) {
      a[this[key]] = key;
    }
    return a;
  }
});

/**
 * Check if the player is blacklisted or try to join again from the same network,
 * will be kicked if one of the above two conditions is met.
 * @param {PlayerObject} player
 */

function check(player) {
  var { [player.conn]: conn } = connections.swap();
  var blacklist = [];
  if (BLACKLIST_MODE && blacklist.find(p => p.conn == player.conn)) return room.kickPlayer(player.id, 'BLACKLISTED');
  if (CONNECTION_MODE && conn) return room.kickPlayer(player.id, 'It is not allowed to join more than one player from the same network');
  connections[player.id] = player.conn;
};
