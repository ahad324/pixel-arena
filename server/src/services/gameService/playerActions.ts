import type { Room,  GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GRID_SIZE, GAME_SETTINGS } from "@config/constants";
import { runMoveLogic } from "./gameLogic";

export const playerActions = {
  updatePlayerPosition: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string,
    newPos: { x: number; y: number }
  ): GameEvent[] => {
    const room = rooms.get(roomId);
    const events: GameEvent[] = [];
    if (!room || room.gameState.status !== "playing") return events;

    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.isEliminated) return events;

    const now = Date.now();
    if (player.effects?.some((e) => e.type === "frozen" && e.expires > now))
      return events;

    if (
      newPos.x < 0 ||
      newPos.x >= GRID_SIZE ||
      newPos.y < 0 ||
      newPos.y >= GRID_SIZE
    )
      return events;

    const isSlowed = player.effects?.some(
      (e) => e.type === "slow" && e.expires > now
    );
    const isSprinting =
      player.isInfected && player.sprintUntil && now < player.sprintUntil;
    const moveCooldown = isSprinting ? 50 : isSlowed ? 250 : 100;

    if (player.lastMoveTime && now - player.lastMoveTime < moveCooldown)
      return events;
    player.lastMoveTime = now;

    if (
      room.gameMode === GameMode.MAZE_RACE &&
      room.gameState.maze?.grid[newPos.y]?.[newPos.x] === 1
    )
      return events;

    player.x = newPos.x;
    player.y = newPos.y;
    events.push({
      name: "player-moved",
      data: { playerId, x: player.x, y: player.y },
    });

    events.push(...runMoveLogic(room, player));
    return events;
  },

  activateAbility: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string
  ): GameEvent[] => {
    const room = rooms.get(roomId);
    if (!room || room.gameState.status !== "playing") return [];
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return [];

    const now = Date.now();
    if (room.gameMode === GameMode.INFECTION_ARENA) {
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
                playerId,
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
                playerId,
                ability: "shield",
                expires: player.shieldUntil,
              },
            },
          ];
        }
      }
    }
    return [];
  },

  submitGuess: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string,
    guess: string
  ): GameEvent[] => {
    const room = rooms.get(roomId);
    if (
      !room ||
      room.gameState.status !== "playing" ||
      room.gameMode !== GameMode.SPY_AND_DECODE ||
      room.gameState.phase !== "guessing"
    )
      return [];
    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.guess) return [];

    if (!room.gameState.playerGuesses) room.gameState.playerGuesses = {};
    room.gameState.playerGuesses[playerId] = guess;
    player.guess = guess;
    return [{ name: "player-guessed", data: { playerId, guess } }];
  },
};
