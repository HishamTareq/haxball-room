let CONNECTION_MODE = true;
let RECAPTCHA_MODE = false;
let BLACKLIST_MODE = true;
let CLEARBANS_MODE = true;

let mainColor = 0x43A047;
let secondaryColor = 0x8bc34a;
let warningColor = 0xc62828;
let tipColor = 0x9e9e9e;

let token = "thr1.AAAAAGPRpOIj_py6ZQaRuw.3IaKyN8Jid8";
let roomName = "room name";
let public = false;
let noPlayer = true;
let maxPlayers = 5;

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
  ],
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
  CLEARBANS_MODE && room.sendAnnouncement("In this demo room, banlist is emptied every 10 minutes, players who abuse permissions will be blacklisted 📌\nbecause there are no moderators in the room at the moment, so be careful!", player.id, 0x757575, "small");
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
      room.sendAnnouncement("You are not admin", player.id, warningColor, null, 2);
      return false;
    }
    run(command, player, message);
    return command.display;
  }
  if (isMutedPlayer(player.id)) {
    room.sendAnnouncement("You are muted", player.id, warningColor, null, 2);
    return false;
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
  return [...commands.public, ...commands.private].find(c => message.match(c.syntax)?.[0] == message);
};

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
