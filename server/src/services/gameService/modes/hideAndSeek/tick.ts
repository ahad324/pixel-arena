import type { Room, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GAME_SETTINGS } from "@config/constants";
import { hideAndSeekLogic } from "./logic";

const TICK_INTERVAL = 1000 / 20; // 50ms for a 20Hz tick rate

export const hideAndSeekTick = {
  tick: (room: Room): GameEvent[] => {
    if (room.gameState.status !== "playing") return [];
    const roomEvents: GameEvent[] = [];
    const now = Date.now();
    const settings = GAME_SETTINGS[GameMode.HIDE_AND_SEEK];

    // Timer logic
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
        roomEvents.push(...hideAndSeekLogic.endGame(room));
        return roomEvents; // Game over, no more processing
      }
    }

    // Player conversion logic
    const playersToConvert = room.players.filter(
      (p) => p.isCaught && p.conversionTime && now >= p.conversionTime
    );
    if (playersToConvert.length > 0) {
      playersToConvert.forEach((p) => {
        p.isCaught = false;
        p.isSeeker = true;
        p.conversionTime = undefined;
        roomEvents.push({
          name: "player-converted",
          data: { playerId: p.id },
        });
      });

      // Check for win condition after conversion
      const remainingHiders = room.players.filter((p) => !p.isSeeker);
      if (remainingHiders.length === 0) {
        roomEvents.push(...hideAndSeekLogic.endGame(room));
        return roomEvents;
      }
    }

    // Footprint fading logic
    const initialFootprintCount = room.gameState.footprints?.length || 0;
    room.gameState.footprints = room.gameState.footprints?.filter(
      (fp) => now - fp.timestamp < settings.FOOTPRINT_FADE_DURATION
    );
    if (room.gameState.footprints?.length !== initialFootprintCount) {
      roomEvents.push({
        name: "footprints-update",
        data: { footprints: room.gameState.footprints },
      });
    }

    return roomEvents;
  },
};
