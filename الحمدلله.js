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
        if (TOUCHES[players[i].team == 1 ? 2 : 1].assist.id !== undefined) {
          TOUCHES[players[i].team == 1 ? 2 : 1].assist.name = undefined;
          TOUCHES[players[i].team == 1 ? 2 : 1].assist.id = undefined;
        }
        TOUCHES[players[i].team].last.name = players[i].name;
        TOUCHES[players[i].team].last.id = players[i].id;
        if (TOUCHES[players[i].team].assist.id === undefined) {
          TOUCHES[players[i].team].assist.name = players[i].name;
          TOUCHES[players[i].team].assist.id = players[i].id;
        }
      }
    }
  }
  ;
  room.onPlayerBallKick = function (player) {
    lastT.name = player.name;
    lastT.team = player.team;
    lastT.id = player.id;
    TOUCHES[player.team].last.name = player.name;
    TOUCHES[player.team].last.id = player.id;
    if (TOUCHES[player.team].assist.id !== undefined) return;
    TOUCHES[player.team].assist.name = player.name;
    TOUCHES[player.team].assist.id = player.id;
  }
  ;
  room.onPositionsReset = function () {
    TOUCHES[1].last.name = undefined;
    TOUCHES[1].last.id = undefined;
    TOUCHES[2].assist.name = undefined;
    TOUCHES[2].assist.id = undefined;
    lastT.name = undefined;
    lastT.team = undefined;
    lastT.id = undefined;
  }
  ;
  room.onTeamGoal = function (team) {
    var time = room.getScores().time;
    if (team != lastT.team) {
      room.sendAnnouncement('🥅 Own goal! ' + lastT.name + " for " + (team == 1 ? 'RED' : 'BLUE') + " team [" + floor(time) + ']', null, team == 1 ? 0xe56e56 : 0x5689e5);
    } else {
      if (TOUCHES[team].assist.id === TOUCHES[team].last.id) {
        room.sendAnnouncement(`🥅 Goal! ${ TOUCHES[team].last.name } scored for his ${(team == 1 ? 'RED' : 'BLUE')} team ${floor(time)}`, null, 0xff8c00)
      } else {
        room.sendAnnouncement(`🥅 Goal! ${ TOUCHES[team].last.name } scored a goal for his ${(team == 1 ? 'RED' : 'BLUE')} team, Assist ${TOUCHES[team].assist.name} ${floor(time)}`, null, 0xff8c00);
        room.sendAnnouncement(`Assist ${TOUCHES[team].assist.name} ${floor(time)}`, null, 0xff8c00, 'small');
      }
    }
  }
  ;
  room.onGameStart = function () {
    TOUCHES[1].last.name = undefined;
    TOUCHES[1].last.id = undefined;
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
