const MAP = window.localStorage.getItem("_map");

let CONNECTION_MODE = true;
let RECAPTCHA_MODE = false;
let BLACKLIST_MODE = true;
let CLEARBANS_MODE = true;

let mainColor = 0x4CAF50;
let secondaryColor = 0xC0CA33;
let warningColor = 0xc62828;
let tipColor = 0x8bc34a;
let pmColor = 0xda00ff;

const config = {
  token: "thr1.AAAAAGPXMIVjygCSmTAgQw.mWfU7FH29is",
  roomName: "⚙️ demo",
  public: true,
  noPlayer: true,
  maxPlayers: 9,
  geo:{"lat":31.2162,"lon":29.9529,"code":"eg"}
};

const connections = {};
const AFKS = [];

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
      name: "pm",
      id: 4,
      syntax: /pm #\d+ .+/i,
      admin: false,
      display: false,
    },
    {
      name: "clearbans",
      id: 5,
      syntax: /clearbans/i,
      admin: true,
      display: true,
    },
    {
      name: "afk",
      id: 6,
      syntax: /afk/i,
      admin: false,
      display: false,
    },
  ],
}

function updateAdmins() { 
  // Get all players
  var players = room.getPlayerList();
  if ( players.length == 0 ) return; // No players left, do nothing.
  if ( players.find((player) => player.admin) != null ) return; // There's an admin left so do nothing.
  room.setPlayerAdmin(players[0].id, true); // Give admin to the first non admin player in the list
}

const room = HBInit(config);

room.setRequireRecaptcha(RECAPTCHA_MODE);
room.setTeamsLock(true)
room.setCustomStadium(MAP);

room.onPlayerJoin = function (player) {
  check({ id: player.id, conn: player.conn });
  CLEARBANS_MODE && room.sendAnnouncement("In this demo room, banlist is emptied every 10 minutes, players who abuse permissions will be blacklisted 📌\nbecause there are no moderators in the room at the moment, so be careful!", player.id, 0x757575, "small");
  room.sendAnnouncement("Welcome " + player.name + ", Check " + commands.char + "help to show public commands", player.id, tipColor);
  updateAdmins();
};

setTimeout(() => {
  CLEARBANS_MODE && room.clearBans();
}, 60000 * 10);

room.onPlayerLeave = function (player) {
  delete connections[player.id];
  removeFromAFK(player.id);
  updateAdmins();
};

room.onPlayerChat = function (player, message) {
  var message = message.trim();
  if (checkCommandSyntax(message)) {
    let command = getCommandBySyntax(message);
    if (!command) return false;
    if (command.admin && !player.admin) {
      room.sendAnnouncement("You are not an admin", player.id, warningColor, null, 2);
      return false;
    }
    run(command, player, message);
    return command.display;
  }
};

room.onPlayerTeamChange = function (c) {
  if (isPlayerAFK(c.id)) {
    room.setPlayerTeam(c.id, 0);
  }
};

room.onPlayerAdminChange = function (c) {
  if (isPlayerAFK(c.id)) {
    room.setPlayerAdmin(c.id, false);
  }
};

room.onStadiumChange = function (newStadiumName) {
  if (newStadiumName !== "Spacebounce Official Map") {
    room.setCustomStadium(MAP);
  }
};

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

function isPlayerAFK(playerID) {
  return Boolean(AFKS.find(p => p.id == playerID));
};

function removeFromAFK(playerID) {
  AFKS.forEach((p, index, array) => {
    if (p.id == playerID) {
      array.splice(index, 1);
    }
  });
};

/**
 * Once the command object is passed in, its function will be executed.
 * @param { object } command
 * @param { PlayerObject } player
 * @param { string } message
 */

function run(command, player, message) {
  switch (command.id) {
    case 1:
      const formatter = new Intl.ListFormat("en", { style: "short", type: "conjunction" });
      room.sendAnnouncement("Commands: " + formatter.format(commands.public.map((c) => commands.char + c.name)), player.id, mainColor);
    break;
    case 2:
      room.kickPlayer(player.id, "Goodbye!");
    break;
    case 3:
      room.setPlayerAdmin(player.id, false);
    break;
    case 4:
      const consignee = room.getPlayer(message.match(/[0-9]+/)[0]);
      const MESSAGE = message.split(new RegExp(commands.char + command.name + " #\\d+ ")).reduce((c, p) => c + p).trim();
      if (!consignee || consignee.id == player.id) return;
      room.sendAnnouncement("To " + consignee.name + ": " + MESSAGE, player.id, pmColor, null, 1);
      room.sendAnnouncement("From " + player.name + ": " + MESSAGE, consignee.id, pmColor, null, 2);
    break;
    case 5:
      room.clearBans();
      room.sendAnnouncement("The Banlist has been cleared", null, secondaryColor);
    break;
    case 6:
      if (isPlayerAFK(player.id)) {
        const playerStartAFKTime = AFKS.find(p => p.id === player.id).return;
        const currentTime = new Date();
        if (!(((currentTime.getTime() - playerStartAFKTime.getTime()) / 1000) > 15)) {
          room.sendAnnouncement("You can return after " + (15 - Math.trunc((currentTime.getTime() - playerStartAFKTime.getTime()) / 1000)) +" seconds", player.id, warningColor, null, 0);
          return;
        }
        removeFromAFK(player.id);
      } else {
        AFKS.push({ name: player.name, id: player.id, return: new Date() });
        room.setPlayerAdmin(player.id, false);
        room.setPlayerTeam(player.id, 0);
      }
      room.sendAnnouncement(player.name + " " + (isPlayerAFK(player.id) ? "is now AFK" : "has returned"), null, 0xff9800);
    break;
  }
};
