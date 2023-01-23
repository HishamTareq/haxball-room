const connections = {};

const token = "thr1.AAAAAGPO7uiamhFANnq8TA.rthYpFquET0";
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

function check(player) {
  var { [player.conn]: conn } = connections.swap();
  var blacklist = JSON.parse(window.localStorage.getItem('blacklist'));
  if (BLACKLIST_MODE && blacklist.find(p => p.conn == player.conn)) return room.kickPlayer(player.id, 'BLACKLISTED');
  if (CONNECTION_MODE && conn) return room.kickPlayer(player.id, 'It is not allowed to join more than one player from the same network');
  connections[player.id] = player.conn;
};
