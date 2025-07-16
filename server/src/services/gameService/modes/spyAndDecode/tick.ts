import type { Room, GameEvent } from "@app-types/index";
import { GAME_SETTINGS } from "@config/constants";
import { GameMode } from "@app-types/index";
import { spyAndDecodeLogic } from "./logic";

const TICK_INTERVAL = 1000 / 20; // 50ms for a 20Hz tick rate

export const spyAndDecodeTick = {
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
        if (room.gameState.phase === "signaling") {
          room.gameState.phase = "guessing";
          room.gameState.timer =
            GAME_SETTINGS[GameMode.SPY_AND_DECODE].GUESS_TIME;
          roomEvents.push({
            name: "phase-changed",
            data: { phase: "guessing", timer: room.gameState.timer },
          });
        } else {
          roomEvents.push(...spyAndDecodeLogic.endGame(room));
        }
      }
    }

    return roomEvents;
  },
};
