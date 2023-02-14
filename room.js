const MAP = this.localStorage.getItem('map');

const PREFIX = '!';

const AFKS = [];

const BANS = [];

const roomConfig = {
  noPlayer: true,
  public: true,
  maxPlayers: 13,
  roomName: 'DEMO - 🪐 SPACEBOUNCE 🪐 @ONN',
  token: 'thr1.AAAAAGPrXOObq_Bf_ThBWg.iJULNb3ronI',
  geo: {
    "lat": 144.2162,
    "lon": 105.9529,
    "code": "eg"
  }
};

const commands = [
  {
    name: 'help',
    syntax: /(help|commands)/i,
    id: 'SLeAJY',
    admin: false,
    display: false,
  }, {
    name: 'bb',
    syntax: /(bb|leave|ggs)/i,
    id: 'zoPLOY',
    admin: false,
    display: false,
  }, {
    name: 'waive',
    syntax: /(waive|resign)/i,
    id: 'VQHXD0',
    admin: false,
    display: false,
  }, {
    name: 'afk',
    syntax: /afk/i,
    id: '0NQlg9',
    admin: false,
    display: false,
  }, {
    name: 'clearbans',
    syntax: /clearbans/i,
    id: 'SSEUhP',
    admin: true,
    display: true,
  }
];

const ball = {
  discIndex: 0,
  lastTouch: {
    name: null,
    id: null,
    team: null,
  },
  lastPass: {
    name: null,
    id: null,
  },
  dispose: function () {
    this.lastPass.name = this.lastPass.id = this.lastTouch.name = this.lastTouch.id = this.lastTouch.team = null;
  },
};

const distance = function (p, b) {
  return Math.sqrt(((p.x - b.x)** 2) + ((p.y - b.y)** 2));
};

const onPlayerTouchBall = function (player) {
  if ( player.id != ball.lastTouch.id ) {
    if ( player.team == ball.lastTouch.team ) {
      ball.lastPass.name = ball.lastTouch.name;
      ball.lastPass.id = ball.lastTouch.id;
    } else {
      ball.lastPass.name = ball.lastPass.id = null;
    }
    ball.lastTouch.name = player.name;
    ball.lastTouch.id = player.id;
    ball.lastTouch.team = player.team;
  }
};

const isOwnGoal = function (team) {
  return ball.lastTouch.team != team;
};

const goalMessages = {
  "Normal goal": [
    "The [[team]] team scores a goal with [[playerName]]'s feet!",
  ],
  "Own goal": [
    "Oh, an Own goal from [[playerName]] for the opposing team!"
  ],
};

const teams = {
  "1": 'RED',
  "2": 'BLUE',
};

const room = HBInit(roomConfig);

const getPlayerAFK = function (player) {
  return AFKS.find(p => p.id == player.id) != null;
};

const removePlayerFromAFK = function(player) {
  AFKS.forEach((p, index, array) => {
    if (p.id == player.id) {
      array.splice(index, 1);
    }
  });
};

const getCommandProperties = function (message) {
  var message = message.slice(1);
  return commands.find(c => message.match(c.syntax)?.[0] == message);
};

const updateAdmins = function() {
  var players = room.getPlayerList();
  if ( players.length == 0 ) return;
  if ( players.find((player) => player.admin) != null ) return;
  room.setPlayerAdmin(players[0].id, true);
};

setTimeout(() => {
  room.clearBans();
}, 60000 * 10);

const execute = function (message, player) {
  var command = getCommandProperties(message);
  if (!command) return false;
  if ((command.admin && !player.admin) && command.id != 'SSEUhP') {
    room.sendAnnouncement('You are not an admin', player.id, 0xcd5c5c, undefined, 0);
    return false;
  }
  switch (command.id) {
    case 'SLeAJY':
      const formatter = new Intl.ListFormat('en', { style: 'short', type: 'conjunction' });
      room.sendAnnouncement(formatter.format(commands.map(c => PREFIX + c.name)), player.id, 0x66cdaa);
      break;
    case 'zoPLOY':
      room.kickPlayer(player.id, message);
      break;
    case 'VQHXD0':
        const players = room.getPlayerList();
        if (players.filter(p => p.admin).length >= 2) {
          room.setPlayerAdmin(player.id, false);
        }
      break;
    case '0NQlg9':
      if (getPlayerAFK(player)) {
        const { time } = AFKS.find(p => p.id == player.id);
        const currentTime = new Date().getTime();
        const a = (currentTime - time) / 1000;
        if (!(a > 15)) {
          room.sendAnnouncement('You must wait ' + (15 - Math.trunc(a)) + ' seconds to return', player.id, 0xcd5c5c, undefined, 0);
          return false;
        }
        removePlayerFromAFK(player);
      } else {
        AFKS.push({
          id: player.id,
          time: new Date().getTime(),
        });
        room.setPlayerTeam(player.id, 0);
      }
      room.sendAnnouncement(player.name + ' ' + (getPlayerAFK(player) ? 'is now AFK' : 'has returned'), undefined, 0x9e9e9e);
      break;
    case 'SSEUhP':
      if (!player.admin) {
        room.sendAnnouncement('You are not an admin', player.id, 0xcd5c5c, undefined, 0);
        return false;
      }
      if (BANS.length >= 1) {
        room.clearBans();
        room.sendAnnouncement('Banlist has been cleared', undefined, 0x00ff00);
        BANS.length = 0;
      } else {
        return false;
      }
      break
  }
  return command.display;
};

room.setTeamsLock(true);

room.setCustomStadium(MAP);

room.onPlayerJoin = function (player) {
  room.sendAnnouncement("In this demo room, banlist is emptied every 10 minutes, players who abuse permissions will be blacklisted 📌\nbecause there are no moderators in the room at the moment, so be careful!", player.id, 0xff1b84, "small");
  room.sendAnnouncement("Welcome " + player.name + ", Check " + PREFIX + "help to show public commands", player.id, 0x9c27b0);
  updateAdmins();
};

room.onPlayerLeave = function (player) {
  if (room.getPlayerList().length < 1) {
    room.stopGame();
  }
  removePlayerFromAFK(player);
  updateAdmins();
}

room.onGameTick = function () {
  room.getPlayerList().filter((e) => e.team).forEach((player) => {
    const b = room.getDiscProperties(ball.discIndex);
    const { x, y, radius } = room.getPlayerDiscProperties(player.id);
    if (distance({ x: x, y: y }, b) <= (radius + b.radius) + 2) {
      onPlayerTouchBall(player);
    }
  });
};

room.onTeamGoal = function (team) {
  const a = isOwnGoal(team);
  room.sendAnnouncement((a ? goalMessages["Own goal"] : goalMessages["Normal goal"]).random().replace("[[team]]", teams[team]).replace("[[playerName]]", ball.lastTouch.name) + (a ? "" : (ball.lastPass.id ? ", Assist " + ball.lastPass.name : "")), null, team == 1 ? 0xf44336 : 0x5689e5);
};

room.onGameStop = function (byPlayer) {
  ball.dispose();
};

room.onPositionsReset = function () {
  ball.dispose();
};

room.onPlayerBallKick = function (player) {
  onPlayerTouchBall(player);
};

room.onPlayerChat = function (player, message) {
  var message = message.trim();
  if (message.startsWith(PREFIX)) {
    return execute(message, player);
  }
};

room.onPlayerKicked = function (kickPlayer, reason, ban, byPlayer) {
  if (ban) {
    BANS.push(kickPlayer.id);
  }
};

room.onPlayerAdminChange = function (changedPlayer, byPlayer) {
  updateAdmins();
}

room.onPlayerTeamChange = function (changedPlayer, byPlayer) {
  if (getPlayerAFK(changedPlayer)) {
    room.setPlayerTeam(changedPlayer.id, 0);
  }
};

room.onStadiumChange = function (newStadiumName, byPlayer) {
  if (newStadiumName != JSON.parse(MAP).name) {
    room.setCustomStadium(MAP);
  }
};

Array.prototype.random = function () {
  return this[Math.floor((Math.random() * this.length))];
};
