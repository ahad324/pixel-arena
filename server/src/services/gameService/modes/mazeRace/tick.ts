import type { Room, GameEvent } from "@app-types/index";
import { mazeRaceLogic } from "./logic";

const TICK_INTERVAL = 1000 / 20;

export const mazeRaceTick = {
  tick: (room: Room): GameEvent[] => {
    if (room.gameState.status !== "playing") return [];

    const roomEvents: GameEvent[] = [];

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

      if (room.gameState.timer <= 0 && !room.gameState.winner) {
        roomEvents.push(...mazeRaceLogic.endGame(room));
      }
    }

    return roomEvents;
  },
};
