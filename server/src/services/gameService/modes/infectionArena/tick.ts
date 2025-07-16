import type { Room, GameEvent } from "@app-types/index";
import { infectionArenaLogic } from "./logic";

const TICK_INTERVAL = 1000 / 20; // 50ms for a 20Hz tick rate

export const infectionArenaTick = {
  tick: (room: Room): GameEvent[] => {
    if (room.gameState.status !== "playing") return [];
    const roomEvents: GameEvent[] = [];
    const now = Date.now();

    if (room.gameState.timer > 0) {
      const oldTimer = Math.ceil(room.gameState.timer);
      room.gameState.timer = Math.max(
        0,
        room.gameState.timer - TICK_INTERVAL / 1000
      );
      const newTimer = Math.ceil(room.gameState.timer);

      if (newTimer < oldTimer) {
        roomEvents.push({ name: "timer-update", data: { time: newTimer } });
      }

      if (room.gameState.timer <= 0) {
        roomEvents.push(...infectionArenaLogic.endGame(room));
      }
    }

    return roomEvents;
  },
};
