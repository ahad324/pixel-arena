import type { Room, GameEvent } from "@app-types/index";
import { GAME_SETTINGS } from "@config/constants";
import { tagLogic } from "./logic";

const TICK_INTERVAL = 1000 / 20; // 50ms for a 20Hz tick rate

export const tagTick = {
  tick: (room: Room): GameEvent[] => {
    if (room.gameState.status !== "playing") return [];
    const roomEvents: GameEvent[] = [];
    const now = Date.now();

    if (room.gameState.timer > 0) {
      const oldTimer = Math.ceil(room.gameState.timer);
      room.gameState.timer = Math.max(0, room.gameState.timer - TICK_INTERVAL / 1000);
      const newTimer = Math.ceil(room.gameState.timer);

      if (newTimer < oldTimer) {
        roomEvents.push({ name: "timer-update", data: { time: newTimer } });
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
      }

      if (room.gameState.timer <= 0) {
        roomEvents.push(...tagLogic.endGame(room));
      }
    }

    return roomEvents;
  },
};