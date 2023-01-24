/**
 * Enable and disable connection mode.
 */
let CONNECTION_MODE = true;
/**
 * Enable and disable Recaptcha mode.
 */
let RECAPTCHA_MODE = false;
/**
 * Enable and disable blacklist mode.
 */
let BLACKLIST_MODE = true;

let mainColor = 0xFF9800;
let tipColor = 0xFF7043;

let token = "thr1.AAAAAGPQU8a1kggh_SZRJw.kWb6Q-s8NLQ";
let roomName = "NAME";
let public = false;
let noPlayer = true;
let maxPlayers = 12;
/**
 * An object that contains the current players `id` as a `key` and its `value` is `conn`.
 */
const connections = {};

const commands = {
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
      syntax: /(bb|leave)/i,
      display: false,
    },
    {
      name: "waive",
      id: 3,
      syntax: /(waive|resign)/i,
      display: false,
    },
  ]
}

const room = HBInit({
  maxPlayers: maxPlayers,
  roomName: roomName,
  noPlayer: noPlayer,
  public: public,
  token: token,
});

room.setRequireRecaptcha(RECAPTCHA_MODE);

room.onPlayerJoin = function (player) {
  check({ id: player.id, conn: player.conn });
  room.sendAnnouncement("Welcome " + player.name + ", Check " + commands.char + "help to show public commands", player.id, tipColor);
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
  writable: true,
});

/**
 * Check if the player is blacklisted or try to join again from the same network,
 * will be kicked if one of the above two conditions is met.
 * @param { PlayerObject } player
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
 * @param { string } message
 * @returns `true` if the command is written in the default form, otherwise `false`.
 */

function checkCommandSyntax(message) {
  var char = commands.char;
  return message.startsWith(char) && message.length > char.length;
};

/**
 * @param { string } message
 * @returns Command properties.
 */

function getCommandBySyntax(message) {
  var message = message.slice(1);
  return [...commands.public].find(c => message.match(c.syntax)?.[0] == message);
};

/**
 * Once the command object is passed in, its function will be executed.
 * @param { object } command
 * @param { PlayerObject } player
 */

function run(command, player = { id: 0 }) {
  switch (command.id) {
    case 1:
      const formatter = new Intl.ListFormat("en", { style: "short", type: "conjunction" });
      room.sendAnnouncement("Commands: " + formatter.format(commands.public.map((c) => commands.char + c.name)), player.id, mainColor);
    break;
    case 2:
      room.kickPlayer(player.id, "Good Bye!");
    break;
    case 3:
      room.setPlayerAdmin(player.id, false);
    break;
  }
};
