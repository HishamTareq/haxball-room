const Command = class {
  static prefix = "!";
  constructor(name, syntax, id, admin, display) {
    this.name = name;
    this.syntax = syntax;
    this.id = id;
    this.admin = admin;
    this.display = display;
  }
};

const connections = {};

const commands = [
  new Command('help', new RegExp('(\\s+)?' + Command.prefix + '(\\s+)?(h(\\s+)?e(\\s+)?l(\\s+)?p|c(\\s+)?o(\\s+)?m(\\s+)?m(\\s+)?a(\\s+)?n(\\s+)?d(\\s+)?s)(\\s+)?', "i"), 1, false, false),
  new Command('admin', new RegExp('(\\s+)?' + Command.prefix + '(\\s+)?a(\\s+)?d(\\s+)?m(\\s+)?i(\\s+)?n(\\s+)?', 'i'), 2, false, false),
  new Command('waive', new RegExp('(\\s+)?' + Command.prefix + '(\\s+)?w(\\s+)?a(\\s+)?i(\\s+)?v(\\s+)?e(\\s+)?', 'i'), 3, false, false),
  new Command('afk', new RegExp('(\\s+)?' + Command.prefix + '(\\s+)?a(\\s+)?f(\\s+)?k(\\s+)?', 'i'), 4, false, false),
  new Command('afks', new RegExp('(\\s+)?' + Command.prefix + '(\\s+)?a(\\s+)?f(\\s+)?k(\\s+)?s(\\s+)?', 'i'), 5, false, false),
];

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

Command.prototype.run = function (player) {
  if (this.admin && !player.admin) return room.sendAnnouncement('You are not admin.', player.id);
  switch (this.id) {
    case 1:
      room.sendAnnouncement("Commands: " + new Intl.ListFormat("en", { style: "short", type: "conjunction" }).format(commands.map((c) => Command.prefix + c.name)), player.id, 0xff6347);
    break;
    case 2:
      room.setPlayerAdmin(player.id, true);
    break;
    case 3:
      room.setPlayerAdmin(player.id, false);
    break;
  }
}

room.setRequireRecaptcha(RECAPTCHA_MODE);

room.onPlayerJoin = function (player) {
  check({ id: player.id, conn: player.conn });
  room.sendAnnouncement("Welcome " + player.name + ", Check " + Command.prefix + "help to show our active commands", player.id, 0xff9800);
};

room.onPlayerChat = function (player, message) {
  var command = commands.find(c => message.match(c.syntax)?.[0] == message);
  command?.run(player);
  return command?.display;
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
