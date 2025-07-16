import type { Room, GameEvent } from "@app-types/index";

const TICK_INTERVAL = 1000 / 20; // 50ms for a 20Hz tick rate

export const trapRushTick = {
  tick: (room: Room): GameEvent[] => {
    if (room.gameState.status !== "playing") return [];
    const roomEvents: GameEvent[] = [];
    return roomEvents;
  },
};