const MAP = window.localStorage.getItem('map');

const BANS = [];

const AFKS = [];

const ORDER = [];

const PREFIX = '!';

const roomConfig = {
  roomName: 'MiniHSC SPACEBOUNCE v1.0 🌕 🦅',
  token: 'thr1.AAAAAGPwmns1h0xuiTfOzQ.nueJuhHgQ_w',
  noPlayer: true,
  public: true,
  maxPlayers: 10,
};

const ball = {
  DISC_INDEX: 0,
  touch: {
    name: null,
    id: null,
    team: null,
  },
  assist: {
    name: null,
    id: null,
    team: null,
  },
  setTouch: function(a) {
    this.touch.name = a.name;
    this.touch.team = a.team;
    this.touch.id = a.id;
  },
  setAssist: function (a) {
    this.assist.name = a.name;
    this.assist.id = a.id;
    this.assist.team = a.team;
  },
  dispose: function () {
    this.touch.name = this.touch.id = this.touch.team = this.assist.name = this.assist.id = null;
  },
};

const goalMessages = {
  'default': [
    '[[playerName]] has scored a goal for the [[team]] team',
  ],
  'og': [
    'Oh, an Own goal from [[playerName]] for the opposing team'
  ],
};

const teams = {
  '1': 'Red',
  '2': 'Blue',
};

const commands = [
  {
    name: 'help',
    syntax: /(help|commands)/i,
    id: 1,
    admin: false,
    display: false,
    staff: false,
  }, {
    name: 'bb',
    syntax: /(bb|ggs|leave)/i,
    id: 2,
    admin: false,
    display: false,
    staff: false,
  }/*, {
    name: 'bans',
    id: 3000000000000000000000000000000n,
    syntax: /bans/i,
    admin: false,
    display: false,
    staff: false,
  }*//*, {
    name: 'unban',
    syntax: /unban #\d+/i,
    id: 4000000000000000000000000000000n,
    admin: true,
    display: true,
    staff: false,
  }*/, {
    name: 'clearbans',
    syntax: /clearbans/i,
    id: 5,
    admin: true,
    display: true,
    staff: false,
  }, {
    name: 'waive',
    syntax: /(waive|resign)/i,
    id: 6,
    admin: false,
    display: true,
    staff: false,
  }, {
    name: 're',
    syntax: /re/i,
    id: 7,
    admin: true,
    display: true,
    staff: false,
  }, {
    name: 'afk',
    syntax: /afk/i,
    id: 8,
    admin: false,
    display: false,
    staff: false,
  }, {
    name: 'afks',
    syntax: /afks/i,
    id: 9,
    admin: false,
    display: false,
    staff: false,
  }, {
    name: 'pm',
    syntax: /pm #\d+ .+/i,
    id: 10,
    admin: false,
    display: false,
    staff: false,
  }, {
    name: 't',
    syntax: /t .+/i,
    id: 11,
    admin: false,
    display: false,
    staff: false,
  }/*, {
    name: 'settings',
    id: 12,
    admin: false,
    display: false,
    syntax: /settings .+/i,
    staff: false,
  }*//*, {
    name: 'rand',
    id: 13,
    syntax: /(rand|random)/i,
    admin: false,
    display: true,
    staff: false,
  }*//*, {
    name: 'top',
    id: 14,
    syntax: /top/i,
    admin: false,
    display: true,
    staff: false,
  }*//*, {
    name: 'bottom',
    id: 15,
    syntax: /bottom/i,
    admin: false,
    display: true,
    staff: false,
  }*//*, {
    name: 'kickafks',
    id: 16,
    syntax: /kickafks/i,
    admin: true,
    display: true,
    staff: false,
  }*/, {
    name: 'mute',
    id: 17,
    syntax: /mute #\d+ \d+(s|m|h|y)/i,
    admin: false,
    display: true,
    staff: true,
  }, {
    name: 'unmute',
    id: 18,
    syntax: /unmute #\d+/i,
    admin: false,
    display: true,
    staff: true,
  }, {
    name: 'block',
    id: 19,
    syntax: /block #\d+/i,
    admin: false,
    display: true,
    staff: true,
  }, {
    name: 'move',
    id: 20,
    syntax: /move #\d+ \d+/i,
    admin: false,
    display: true,
    staff: true,
  }, {
    name: 'admin',
    id: 21,
    syntax: /admin/i,
    admin: false,
    display: true,
    staff: true,
  }, {
    name: 'removeadmin',
    id: 22,
    syntax: /removeadmin #\d+/i,
    admin: false,
    display: true,
    staff: true,
  },
];

const room = HBInit(roomConfig);

room.setTeamsLock(true);

room.setCustomStadium(MAP);

room.setTeamColors(1, 0, 0xFFFFFF, [0xFF3636]);

room.setTeamColors(2, 0, 0xFFFFFF, [0x006FFF]);

room.onPlayerJoin = function (player) {
  room.setPlayerAdmin(player.id, true);
  room.sendAnnouncement("Welcome " + player.name + ", Check " + PREFIX + "help to show public commands", player.id, 0xff2828);
  updateAdmins();
}

room.onPlayerKicked = function (kickPlayer, reason, ban, byPlayer) {
  if (ban) {
    BANS.push({
      name: kickPlayer.name,
      id: kickPlayer.id,
    });
  }
};

room.onPlayerTeamChange = function (changedPlayer, byPlayer) {
  if (getPlayerAFK(changedPlayer)) {
    room.setPlayerTeam(changedPlayer.id, 0);
    room.reorderPlayers(ORDER, true);
  } else {
    const spectators = room.getPlayerList().filter(p => p.team == 0);
    ORDER.length = 0;
    for (let i = 0; i < spectators.length; i++) {
      ORDER.push(spectators[i].id);
    }
  }
};

room.onPlayerLeave = function (player) {
  removePlayerFromAFK(player);
  const spectators = room.getPlayerList().filter(p => p.team == 0);
  ORDER.length = 0;
  for (let i = 0; i < spectators.length; i++) {
    ORDER.push(spectators[i].id);
  }
  updateAdmins();
};

room.onPlayerChat = function (player, message) {
  var message = message.trim();
  if (message.startsWith(PREFIX)) {
    return run(message, player);
  }
};

room.onStadiumChange = function (newStadiumName) {
  if (newStadiumName != JSON.parse(MAP).name) {
    room.setCustomStadium(MAP);
  }
};

room.onPlayerAdminChange = function (changedPlayer, byPlayer) {
  // updateAdmins();
};

room.onPlayerBallKick = function (player) {
  updateBallProperties(player);
};

room.onPositionsReset = function () {
  ball.dispose();
};

room.onGameStop = function () {
  ball.dispose();
};

room.onGameTick = function () {
  const a = room.getDiscProperties(ball.DISC_INDEX);
  const players = room.getPlayerList().filter(p => p.team != 0);
  for (let i = 0; i < players.length; i++) {
    const { radius } = room.getPlayerDiscProperties(players[i].id);
    if (distance(players[i], a) <= (radius + a.radius) + 2) {
      updateBallProperties(players[i]);
    }
  }
};

room.onTeamGoal = function (team) {
  const icon = team == 1 ? '🔴' : '🔵';
  const scores = room.getScores();
  const a = isOwnGoal(team);
  room.sendAnnouncement(icon + ' ' + (a ? goalMessages['og'] : goalMessages['default']).random().replace('[[team]]', teams[team]).replace('[[playerName]]', ball.touch.name) + (a ? '' : (ball.assist.id ? ' with ' + ball.assist.name + '\'s assist' : '')) + ' [' + scores.red + ' - ' + scores.blue + ']' + ' ' + icon, undefined, team == 1 ? 0xff3e3e : 0x2196f3);
};

function distance(player, ball) {
  return Math.sqrt(((player.position.x - ball.x)** 2) + ((player.position.y - ball.y)** 2));
};

function updateBallProperties(player) {
  if (player.id != ball.touch.id) {
    if (player.team == ball.touch.team) {
      ball.setAssist(ball.touch);
    } else {
      ball.setAssist({
        id: null,
        name: null,
        team: null,
      });
    }
    ball.setTouch(player);
  }
};

function isOwnGoal(team) {
  return ball.touch.team != team;
};

function run(message, player) {
  const formatter = new Intl.ListFormat('en', { style: 'short', type: 'conjunction' });
  var cmd = getCommand(message);
  if (!cmd) return false;
  if (cmd.admin && !player.admin) {
    room.sendAnnouncement('You are not admin', player.id, 0xff3838, 'small', 0);
    return false;
  }
  switch (cmd.id) {
    case 1:
      room.sendAnnouncement('For everyone: ' + formatter.format(commands.filter(c => !c.admin && !c.staff).map(c => PREFIX + c.name)), player.id, 0xffa500, 'small');
      room.sendAnnouncement('For admins: ' + formatter.format(commands.filter(c => c.admin).map(c => PREFIX + c.name)), player.id, 0xffa500, 'small');
    break;
    case 2:
      room.kickPlayer(player.id, message);
    break;
    case 3:
      if (BANS.length > 0) {
        room.sendAnnouncement('Bans: ' + formatter.format(BANS.map(p => p.name + '#' + p.id)), player.id, undefined, undefined, 0);
      }
    break;
    case 4:
      const id = message.match(/\d+/)?.[0];
      if (id != null) {
        BANS.forEach((p, index, array) => {
          if (p.id == id) {
            room.clearBan(id);
            room.sendAnnouncement(player.name + " unbanned " + p.name, undefined, 0x7fff00);
            array.splice(index, 1);
          }
        });
      } else {
        return false;
      }
    break;
    case 5:
      if (BANS.length > 0) {
        room.clearBans();
        room.sendAnnouncement("Banlist has been cleared", undefined, 0x7fff00);
        BANS.length = 0;
      } else {
        return false;
      }
    break;
    case 6:
      room.setPlayerAdmin(player.id, false);
    break;
    case 7:
      if (player.team != 0) {
        room.stopGame();
        room.startGame();
      } else {
        return false;
      }
    break;
    case 8:
      if (getPlayerAFK(player)) {
        const { time } = AFKS.find(p => p.id == player.id);
        const currentTime = new Date().getTime();
        const a = (currentTime - time) / 1000;
        if (!(a > 15)) {
          room.sendAnnouncement('You must wait ' + (15 - Math.trunc(a)) + ' seconds to return', player.id, 0xff3838, 'small', 0);
          return false;
        }
        removePlayerFromAFK(player);
      } else {
        AFKS.push({
          id: player.id,
          time: new Date().getTime(),
        });
        room.setPlayerTeam(player.id, 0);
        // room.setPlayerAdmin(player.id, false);
        const spectators = room.getPlayerList().filter(p => p.team == 0);
        ORDER.length = 0;
        for (let i = 0; i < spectators.length; i++) {
          ORDER.push(spectators[i].id);
        }
      }
      room.sendAnnouncement(player.name + ' ' + (getPlayerAFK(player) ? 'is now AFK' : 'has returned'), undefined, 0xff3838);
    break;
    case 11:
      let color = 0xe56e56;
      if (player.team == 2) {
        color = 0x56aae5;
      } else if (player.team == 0) {
        color = 0xededed;
      }
      room.getPlayerList().filter(p => p.team == player.team).forEach((p) => {
        room.sendAnnouncement('[Team] ' + player.name + ': ' + message.slice(2).trim(), p.id, color);
      });
    break;
  }
  return cmd.display;
};

function getCommand(message) {
  var message = message.slice(1);
  return commands.find(c => message.match(c.syntax)?.[0] == message);
};

function getPlayerAFK(player) {
  return AFKS.find(p => p.id == player.id) != null;
};

function removePlayerFromAFK(player) {
  AFKS.forEach((p, index, array) => {
    if (p.id == player.id) {
      array.splice(index, 1);
    }
  });
};

Array.prototype.random = function () {
  return this[Math.floor((Math.random() * this.length))];
};

const updateAdmins = function() {
  var players = room.getPlayerList();
  if ( players.length == 0 ) return;
  if ( players.find((player) => player.admin) != null ) return;
  room.setPlayerAdmin(players[0].id, true);
};
