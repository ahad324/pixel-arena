import type { Room, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GAME_SETTINGS, GRID_SIZE } from "@config/constants";
import { endGame } from "./gameLogic";
import { calculateTerritoryScores } from "./helpers";

const TICK_INTERVAL = 1000 / 20; // 50ms for a 20Hz tick rate

export const gameTick = {
  tick: (rooms: Map<string, Room>): Map<string, GameEvent[]> => {
    const allEvents = new Map<string, GameEvent[]>();
    const now = Date.now();

    rooms.forEach((room, roomId) => {
      if (room.gameState.status !== "playing") return;

      const roomEvents: GameEvent[] = [];
      const { gameState, gameMode } = room;

      // Update timers
      if (gameState.timer > 0) {
        const oldTimer = Math.ceil(gameState.timer);
        gameState.timer = Math.max(0, gameState.timer - TICK_INTERVAL / 1000);
        const newTimer = Math.ceil(gameState.timer);

        if (newTimer < oldTimer) {
          roomEvents.push({ name: "timer-update", data: { time: newTimer } });

          if (gameMode === GameMode.TAG) {
            let pointsChanged = false;
            room.players.forEach((p) => {
              if (!p.isIt && !p.isEliminated) {
                p.score++;
                pointsChanged = true;
              }
            });
            if (pointsChanged) {
              roomEvents.push({
                name: "scores-update",
                data: {
                  scores: room.players.map((p) => ({
                    id: p.id,
                    score: p.score,
                  })),
                },
              });
            }
          } else if (gameMode === GameMode.TERRITORY_CONTROL) {
            const currentScores = calculateTerritoryScores(room);
            let pointsChanged = false;
            room.players.forEach((p) => {
              const newScore = currentScores[p.id] || 0;
              if (p.score !== newScore) {
                p.score = newScore;
                pointsChanged = true;
              }
            });
            if (pointsChanged) {
              roomEvents.push({
                name: "scores-update",
                data: {
                  scores: room.players.map((p) => ({
                    id: p.id,
                    score: p.score,
                  })),
                },
              });
            }
          }
        }

        if (gameState.timer <= 0) {
          if (
            gameMode === GameMode.SPY_AND_DECODE &&
            gameState.phase === "signaling"
          ) {
            gameState.phase = "guessing";
            gameState.timer = GAME_SETTINGS[GameMode.SPY_AND_DECODE].GUESS_TIME;
            roomEvents.push({
              name: "phase-changed",
              data: { phase: "guessing", timer: gameState.timer },
            });
          } else {
            roomEvents.push(...endGame(room));
          }
        }
      }

      // Game-specific tick logic can be added here if needed in the future

      if (roomEvents.length > 0) {
        allEvents.set(roomId, roomEvents);
      }
    });

    return allEvents;
  },
};
