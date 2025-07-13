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

      // Game-specific tick logic
      switch (gameMode) {
        case GameMode.TAG:
          break;
        case GameMode.DODGE_THE_SPIKES:
          if (now >= (gameState.nextSpikeSpawnTime ?? 0)) {
            const newSpike = {
              id: crypto.randomUUID(),
              x: Math.floor(Math.random() * GRID_SIZE),
              y: 0,
            };
            gameState.spikes?.push(newSpike);
            gameState.nextSpikeSpawnTime =
              now + GAME_SETTINGS[gameMode].SPIKE_SPAWN_RATE;
            roomEvents.push({ name: "spike-spawned", data: newSpike });
          }
          if (now >= (gameState.nextSpikeMoveTime ?? 0)) {
            const spikes = gameState.spikes || [];
            for (let i = spikes.length - 1; i >= 0; i--) {
              spikes[i].y += 1;
              if (spikes[i].y >= GRID_SIZE) {
                spikes.splice(i, 1);
              }
            }
            gameState.nextSpikeMoveTime =
              now + GAME_SETTINGS[gameMode].SPIKE_MOVE_RATE;
            roomEvents.push({
              name: "spikes-moved",
              data: { spikes: gameState.spikes },
            });

            const newlyEliminated: string[] = [];
            room.players.forEach((p) => {
              if (
                !p.isEliminated &&
                spikes.some((s) => s.x === p.x && s.y === p.y)
              ) {
                p.isEliminated = true;
                newlyEliminated.push(p.id);
              }
            });
            if (newlyEliminated.length > 0) {
              roomEvents.push({
                name: "players-eliminated",
                data: { playerIds: newlyEliminated },
              });
            }

            const active = room.players.filter((p) => !p.isEliminated);
            if (active.length <= 1 && room.players.length > 1) {
              roomEvents.push(...endGame(room, active[0] || null));
            } else if (active.length === 0 && room.players.length > 0) {
              roomEvents.push(...endGame(room, null));
            }
          }
          break;
      }

      if (roomEvents.length > 0) {
        allEvents.set(roomId, roomEvents);
      }
    });

    return allEvents;
  },
};
