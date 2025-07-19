import type { Room, Player, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GRID_SIZE } from "@config/constants";
import { GAME_SETTINGS } from "@config/constants";
import { createInitialGameState } from "../../common/helpers";
import { gameService } from "@services/gameService/gameService";

export const infectionArenaLogic = {
  startGame: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string
  ): { room: Room | undefined; events: GameEvent[] } => {
    const room = rooms.get(roomId);
    if (
      !room ||
      room.hostId !== playerId ||
      room.gameState.status !== "waiting"
    )
      return { room: undefined, events: [] };

    room.gameState = createInitialGameState(room.gameMode, room.players.length);
    room.gameState.status = "playing";
    room.gameState.timer = GAME_SETTINGS[GameMode.INFECTION_ARENA].TIME_LIMIT;
    room.players.forEach((p) => {
      p.score = 0;
      p.isEliminated = false;
      p.isIt = false;
      p.isInfected = false;
      p.x = Math.floor(Math.random() * GRID_SIZE);
      p.y = Math.floor(Math.random() * GRID_SIZE);
    });
    room.players[Math.floor(Math.random() * room.players.length)].isInfected =
      true;

    return { room, events: [{ name: "game-started", data: { room } }] };
  },

  handleMove: (
    room: Room,
    player: Player,
    newPos: { x: number; y: number }
  ): GameEvent[] => {
    const events: GameEvent[] = [];
    player.x = newPos.x;
    player.y = newPos.y;
    events.push({
      name: "player-moved",
      data: { playerId: player.id, x: player.x, y: player.y },
    });

    if (player.isInfected) {
      const now = Date.now();
      const caughtPlayer = room.players.find(
        (p) => !p.isInfected && p.x === player.x && p.y === player.y
      );
      if (
        caughtPlayer &&
        !(caughtPlayer.shieldUntil && now < caughtPlayer.shieldUntil)
      ) {
        caughtPlayer.isInfected = true;
        events.push({
          name: "player-infected",
          data: { playerId: caughtPlayer.id },
        });
        if (room.players.filter((p) => !p.isInfected).length === 0) {
          events.push(...infectionArenaLogic.endGame(room));
        }
      }
    }
    return events;
  },

  handleAbility: (room: Room, player: Player): GameEvent[] => {
    const now = Date.now();
    const settings = GAME_SETTINGS[GameMode.INFECTION_ARENA];
    if (player.isInfected) {
      if (
        !player.lastSprintTime ||
        now - player.lastSprintTime > settings.SPRINT_COOLDOWN
      ) {
        player.lastSprintTime = now;
        player.sprintUntil = now + settings.SPRINT_DURATION;
        return [
          {
            name: "ability-activated",
            data: {
              playerId: player.id,
              ability: "sprint",
              expires: player.sprintUntil,
            },
          },
        ];
      }
    } else {
      if (
        !player.lastShieldTime ||
        now - player.lastShieldTime > settings.SHIELD_COOLDOWN
      ) {
        player.lastShieldTime = now;
        player.shieldUntil = now + settings.SHIELD_DURATION;
        return [
          {
            name: "ability-activated",
            data: {
              playerId: player.id,
              ability: "shield",
              expires: player.shieldUntil,
            },
          },
        ];
      }
    }
    return [];
  },

  endGame: (room: Room, winner: Player | null = null): GameEvent[] => {
    gameService.deactivateRoom(room.id);

    room.gameState.status = "finished";
    room.gameState.winner = winner ?? evaluateResult(room);

    return [
      {
        name: "game-over",
        data: { winner: room.gameState.winner, players: room.players },
      },
    ];
  },
};

export const evaluateResult = (
  room: Room
): { name: string } | Player | null => {
  const survivors = room.players.filter((p) => !p.isInfected);
  if (survivors.length === 0) {
    return { name: "The Virus" };
  } else {
    return { name: "Survivors" };
  }
};
