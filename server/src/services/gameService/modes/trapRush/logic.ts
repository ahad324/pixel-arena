import type { Room, Player, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GRID_SIZE } from "@config/constants";
import { GAME_SETTINGS } from "@config/constants";
import { createInitialGameState } from "../../common/helpers";
import { trapRushHelpers } from "./helpers";

export const trapRushLogic = {
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
    room.gameState.trapMap = trapRushHelpers.generateTrapMap();
    room.players.forEach((p) => {
      p.score = 0;
      p.isEliminated = false;
      p.isIt = false;
      p.effects = [];
      p.x = Math.floor(Math.random() * GRID_SIZE);
      p.y = 0;
    });

    return { room, events: [{ name: "game-started", data: { room } }] };
  },

  handleMove: (room: Room, player: Player, newPos: { x: number; y: number }): GameEvent[] => {
    const events: GameEvent[] = [];
    player.x = newPos.x;
    player.y = newPos.y;
    events.push({
      name: "player-moved",
      data: { playerId: player.id, x: player.x, y: player.y },
    });

    if (player.y >= room.gameState.finishLine!) {
      events.push(...trapRushLogic.endGame(room, player));
      return events;
    }

    const trap = room.gameState.trapMap?.[player.y]?.[player.x];
    if (trap && !trap.revealed) {
      trap.revealed = true;
      events.push({
        name: "trap-triggered",
        data: { x: player.x, y: player.y, type: trap.type },
      });
      const now = Date.now();
      const settings = GAME_SETTINGS[GameMode.TRAP_RUSH];
      if (!player.effects) player.effects = [];

      let effectType: "frozen" | "slow" | "teleport" | null = null;
      let effectDuration = 0;

      switch (trap.type) {
        case "freeze":
          effectDuration = settings.FREEZE_DURATION;
          effectType = "frozen";
          break;
        case "slow":
          effectDuration = settings.SLOW_DURATION;
          effectType = "slow";
          break;
        case "teleport":
          player.y = Math.max(0, player.y - settings.TELEPORT_DISTANCE);
          effectType = "teleport";
          break;
      }
      if (effectType && effectType !== "teleport") {
        const expires = now + effectDuration;
        player.effects.push({
          type: effectType as "frozen" | "slow",
          expires,
        });
        events.push({
          name: "player-effect",
          data: { playerId: player.id, type: effectType, expires },
        });
      } else if (effectType === "teleport") {
        events.push({
          name: "player-moved",
          data: { playerId: player.id, x: player.x, y: player.y },
        });
      }
    }
    return events;
  },

  endGame: (room: Room, winner: Player | null = null): GameEvent[] => {
    room.gameState.status = "finished";
    if (winner) {
      room.gameState.winner = winner;
    }
    return [
      {
        name: "game-over",
        data: { winner: room.gameState.winner, players: room.players },
      },
    ];
  },
};