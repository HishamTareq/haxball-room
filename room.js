/**
 * Enable and disable connection mode.
 */
var CONNECTION_MODE = true;
/**
 * Enable and disable Recaptcha mode.
 */
var RECAPTCHA_MODE = false;
/**
 * Enable and disable blacklist mode.
 */
var BLACKLIST_MODE = true;

var token = "thr1.AAAAAGPQNu4N_uq_S-RPiw.9oOzTcyHifA";
var roomName = "NAME";
var public = false;
var noPlayer = true;
var maxPlayers = 12;
/**
 * An object that contains the current players `id` as a `key` and its `value` is `conn`.
 */
var connections = {};

var commands = {
  public: [
    {
      name: "help",
      id: 1,
      syntax: /(help|commands)/i,
      display: false,
    },
    {
      name: "bb",
      id: 2,
      syntax: /(bb)/i,
      display: false,
    }
  ]
}

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
  var message = message.trim();
  if (checkCommandSyntax(message)) {
    let command = getCommandBySyntax(message);
    if (!command) return false;
    run(command, player);
    return command.display;
  }
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

Object.defineProperty(commands, 'char', {
  value: "!",
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

/**
 * Check if the command is written in the default form.
 * @param {string} message
 * @returns `true` if the command is written in the default form, otherwise `false`.
 */

function checkCommandSyntax(message) {
  var char = commands.char;
  return message.startsWith(char) && message.length > char.length;
};

/**
 * @param {string} message
 * @returns Command properties.
 */

function getCommandBySyntax(message) {
  var message = message.slice(1);
  return [...commands.public].find(c => message.match(c.syntax)?.[0] == message);
};

/**
 * Once the command object is passed in, its function will be executed.
 * @param {object} command
 * @param {PlayerObject} player
 */

function run(command, player = { id: 0 }) {
  switch (command.id) {
    case 1:
      const formatter = new Intl.ListFormat('en', { style: 'short', type: 'conjunction' });
      room.sendAnnouncement("Commands: " + formatter.format(commands.public.map((c) => commands.char + c.name), player.id));
    break;
  }
};
