var connections = {};

var token = "thr1.AAAAAGPOyW82eiuFbphqaw.B4oIDPWs33w";
var roomName = "NAME";
var public = false;
var noPlayer = true;
var maxPlayers = 5;

var CONNECTION_MODE = true;
var RECAPTCHA_MODE = false;
var BLACKLIST_MODE = true;

var room = HBInit({
  maxPlayers: maxPlayers,
  roomName: roomName,
  noPlayer: noPlayer,
  public: public,
  token: token
});

room.setRequireRecaptcha(RECAPTCHA_MODE);

room.onPlayerJoin = function (player) {
  check({ id: player.id, conn: player.conn });
};

onPlayerLeave = function (player) {
  delete connections[player.id];
}

Object.defineProperty(Object.prototype, 'swap', {
  value: function () {
    var a = {};
    for (let key in this) {
      a[this[key]] = key;
    }
    return a;
  }
});

/**
 * Check the player if he is blacklisted or if he is trying to join twice from the same network,
 * the player will be kicked if the first or the second condition is met
 * @param {PlayerObject} player It should contain the `id` and `conn`.
 */

function check(player) {
  var { [player.conn]: conn } = connections.swap();
  var blacklist = JSON.parse(window.localStorage.getItem('blacklist'));
  if (BLACKLIST_MODE && blacklist.find(p => p.conn == player.conn)) return room.kickPlayer(player.id, 'BLACKLISTED');
  if (CONNECTION_MODE && conn) return room.kickPlayer(player.id);
  connections[player.id] = player.conn;
}
