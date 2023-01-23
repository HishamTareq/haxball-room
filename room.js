const Cmd = class {
  static PREFIX = "!";
  constructor(name, syntax, id, admin, active) {
    this.name = name;
    this.syntax = syntax;
    this.id = id;
    this.admin = admin;
    this.active = active;
  }
};

const connections = {};

const commands = [
  new Cmd('help', /(\s+)?h(\s+)?e(\s+)?l(\s+)?p/i, 1, false, false),
  new Cmd('bb', /(\s+)?b(\s+)?b/i, 2, false, false),
  new Cmd('admin', /(\s+)?a(\s+)?d(\s+)?m(\s+)?i(\s+)?n/i, 3, false, false),
  new Cmd('waive', /(\s+)?w(\s+)?a(\s+)?i(\s+)?v(\s+)?e/i, 4, false, false),
  new Cmd('afk', /(\s+)?a(\s+)?f(\s+)?k/i, 5, false, false),
  new Cmd('afks', /(\s+)?a(\s+)?f(\s+)?k(\s+)?s/i, 6, false, false),
  new Cmd('mute', /(\s+)?m(\s+)?u(\s+)?t(\s+)?e(\s+)?#(\s+)?\d+/i, 7, false, false),
  new Cmd('unmute', /(\s+)?u(\s+)?n(\s+)?m(\s+)?u(\s+)?t(\s+)?e(\s+)?#(\s+)?\d+/i, 8, false, false)
];

const token = "thr1.AAAAAGPOyW82eiuFbphqaw.B4oIDPWs33w";
const roomName = "NAME";
const public = false;
const noPlayer = true;
const maxPlayers = 5;

let CONNECTION_MODE = true;
let RECAPTCHA_MODE = false;
let BLACKLIST_MODE = true;

const room = HBInit({
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

room.onPlayerChat = function (player, message) {

};

room.onPlayerLeave = function (player) {
  delete connections[player.id];
};

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
  if (CONNECTION_MODE && conn) return room.kickPlayer(player.id, 'It is not allowed to join more than one player from the same network');
  connections[player.id] = player.conn;
};
