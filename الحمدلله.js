const HaxballJS = require("haxball.js");

HaxballJS.then((HBInit) => {
  const config = require("./json/config");
  const MAP = JSON.stringify(require('./json/maps/spacebounce.json'));
  const TOUCHES = {
    1: {
      last: {
        name: undefined,
        id: undefined,
      },
      assist: {
        name: undefined,
        id: undefined,
      },
    },
    2: {
      last: {
        name: undefined,
        id: undefined,
      },
      assist: {
        name: undefined,
        id: undefined,
      },
    }
  };
  const lastT = {team: undefined, name: undefined, id: undefined};

  const room = HBInit(config);

  room.setTeamsLock(true);
  room.setCustomStadium(MAP);

  room.onPlayerJoin = function (player) {
    room.setPlayerTeam(player.id, 1);
    room.startGame();
    room.setPlayerAdmin(player.id, true);
  }
  ;
  room.onGameTick = function () {
    const players = room.getPlayerList().filter(p => p.team != 0);
    const ball = room.getDiscProperties(0);
    if (!players.length) return;
    for (let i = 0; i < players.length; i++) {
      const playerP = room.getPlayerDiscProperties(players[i].id);
      if (Math.round(distance({ x: playerP.x, y: playerP.y }, { x: ball.x, y: ball.y })) < ball.radius + playerP.radius + 2) {
        lastT.name = players[i].name;
        lastT.team = players[i].team;
        lastT.id = players[i].id;
        if (!(TOUCHES[players[i].team].last.id == players[i].id)) {
          TOUCHES[players[i].team].assist.name = TOUCHES[players[i].team].last.name;
          TOUCHES[players[i].team].assist.id = TOUCHES[players[i].team].last.id;
        }
        TOUCHES[players[i].team == 1 ? 2 : 1].assist.name = undefined;
        TOUCHES[players[i].team == 1 ? 2 : 1].assist.id = undefined;
        TOUCHES[players[i].team == 1 ? 2 : 1].last.name = undefined;
        TOUCHES[players[i].team == 1 ? 2 : 1].last.id = undefined;
        TOUCHES[players[i].team].last.name = players[i].name;
        TOUCHES[players[i].team].last.id = players[i].id;
      }
    }
  }
  ;
  room.onPlayerBallKick = function (player) {
    lastT.name = player.name;
    lastT.team = player.team;
    lastT.id = player.id;
    if (!TOUCHES[player.team].last.id == player.id) {
      TOUCHES[player.team].assist.name = TOUCHES[player.team].last.name;
      TOUCHES[player.team].assist.id = TOUCHES[player.team].last.id;
    };
    TOUCHES[player.team].last.name = player.name;
    TOUCHES[player.team].last.id = player.id;
    TOUCHES[player.team == 1 ? 2 : 1].assist.name = undefined;
    TOUCHES[player.team == 1 ? 2 : 1].assist.id = undefined;
    TOUCHES[player.team == 1 ? 2 : 1].last.name = undefined;
    TOUCHES[player.team == 1 ? 2 : 1].last.id = undefined;
  }
  ;
  room.onPositionsReset = function () {
    TOUCHES[1].last.name = undefined;
    TOUCHES[1].last.id = undefined;
    TOUCHES[1].assist.name = undefined;
    TOUCHES[1].assist.id = undefined;
    TOUCHES[2].last.name = undefined;
    TOUCHES[2].last.id = undefined;
    TOUCHES[2].assist.name = undefined;
    TOUCHES[2].assist.id = undefined;
    lastT.name = undefined;
    lastT.team = undefined;
    lastT.id = undefined;
  }
  ;
  room.onTeamGoal = function (team) {
    var color = team == 1 ? 0xff2626 : 0x00adff;
    var a = room.getScores();
    if (team != lastT.team) {
      room.sendAnnouncement('Own goal! ' + floor(a.time) + " " + lastT.name + " for " + (team == 1 ? 'RED' : 'BLUE') + " team" + ` [${a.red} - ${a.blue}]`, null, color);
    } else {
      if (TOUCHES[team].assist.id === TOUCHES[team].last.id || TOUCHES[team].assist.id === undefined) {
        room.sendAnnouncement(`Goal! ${floor(a.time)} ${ TOUCHES[team].last.name } scored for his ${(team == 1 ? 'RED' : 'BLUE')} team [${a.red} - ${a.blue}]`, null, color)
      } else {
        room.sendAnnouncement(`Goal! ${floor(a.time)} ${ TOUCHES[team].last.name } scored a goal for his ${(team == 1 ? 'RED' : 'BLUE')} team, Assist ${TOUCHES[team].assist.name} [${a.red} - ${a.blue}]`, null, color);
      }
    }
  }
  ;
  room.onGameStart = function () {
    TOUCHES[1].last.name = undefined;
    TOUCHES[1].last.id = undefined;
    TOUCHES[1].assist.name = undefined;
    TOUCHES[1].assist.id = undefined;
    TOUCHES[2].last.name = undefined;
    TOUCHES[2].last.id = undefined;
    TOUCHES[2].assist.name = undefined;
    TOUCHES[2].assist.id = undefined;
    lastT.name = undefined;
    lastT.team = undefined;
    lastT.id = undefined;
  }
  room.onRoomLink = function (url) {
    console.log(url);
  };
});

function distance(p, b) {
  return Math.sqrt(Math.pow((p.x - b.x), 2) + Math.pow(p.y - b.y, 2));
}

function floor(time) {
  if (Math.floor(time / 60) < 10 || Math.floor(time % 60) < 10) {
      if (Math.floor(time / 60) < 10 && Math.floor(time % 60) >= 10) {
          return `0${Math.floor(time / 60)}:${Math.floor(time % 60)}`;
      }
      else if (Math.floor(time / 60) >= 10 && Math.floor(time % 60) < 10) {
          return `${Math.floor(time / 60)}:0${Math.floor(time % 60)}`;
      }
      else {
          return `0${Math.floor(time / 60)}:0${Math.floor(time % 60)}`;
      }
  }
  else {
      return `${Math.floor(time / 60)}:${Math.floor(time % 60)}`;
  }
}
