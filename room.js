/**
 * Enable or disable connection mode.
 */
let CONNECTION_MODE = false;
/**
 * Enable or disable Recaptcha mode.
 */
let RECAPTCHA_MODE = false;
/**
 * Enable or disable blacklist mode.
 */
let BLACKLIST_MODE = true;
/**
 * Enable or disable Automatic clearbans mode.
 */
let CLEARBANS_MODE = true;

let mainColor = 0xFF9800;
let wrongColor = 0xE53935;
let tipColor = 0xFF7043;

let token = "thr1.AAAAAGPRh2_qpgn7YLiOxQ.ZZjIDNrX3iE";
let roomName = "a's room";
let public = true;
let noPlayer = true;
let maxPlayers = 5;
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
      admin: false,
      display: false,
    },
    {
      name: "bb",
      id: 2,
      syntax: /(bb|leave)/i,
      admin: false,
      display: false,
    },
    {
      name: "waive",
      id: 3,
      syntax: /(waive|resign)/i,
      admin: false,
      display: false,
    },
    {
      name: "clearbans",
      id: 4,
      syntax: /(clearbans)/i,
      admin: true,
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
  password: "111",
});

room.setRequireRecaptcha(RECAPTCHA_MODE);

room.onPlayerJoin = function (player) {
  check({ id: player.id, conn: player.conn });
  CLEARBANS_MODE && room.sendAnnouncement("Banlist is emptied every 10 minutes, players who abuse permissions will be blacklisted 📌\nbecause there are no moderators in the room at the moment, so be careful!", player.id, 0x757575, "small");
  room.sendAnnouncement("Welcome " + player.name + ", Check " + commands.char + "help to show public commands", player.id, tipColor);
};

setTimeout(() => {
  CLEARBANS_MODE && room.clearBans();
}, 60000 * 10);

room.onPlayerLeave = function (player) {
  delete connections[player.id];
};

room.onPlayerChat = function (player, message) {
  var message = message.trim();
  if (checkCommandSyntax(message)) {
    let command = getCommandBySyntax(message);
    if (!command) return false;
    if (command.admin && !player.admin) {
      room.sendAnnouncement("You are not admin", player.id, wrongColor, null, 2);
      return false;
    }
    run(command, player, message);
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
 * Check if the player is AFK.
 * @param { number } playerID
 */

/**
 * Once the command object is passed in, its function will be executed.
 * @param { object } command
 * @param { PlayerObject } player
 */

function run(command, player, message) {
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
    case 4:
      room.clearBans();
      room.sendAnnouncement("Banlist has been cleared by @" + player.name, null, mainColor);
    break;
  }
};
