import type { Trap, TrapType } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GRID_SIZE } from "@config/constants";
import { GAME_SETTINGS } from "@config/constants";

export const trapRushHelpers = {
  generateTrapMap: (): (Trap | null)[][] => {
    const { TRAP_DENSITY } = GAME_SETTINGS[GameMode.TRAP_RUSH];
    const trapTypes: TrapType[] = ["slow", "teleport", "freeze"];
    const map: (Trap | null)[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));
    for (let y = 1; y < GRID_SIZE - 1; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (Math.random() < TRAP_DENSITY) {
          map[y][x] = {
            type: trapTypes[Math.floor(Math.random() * trapTypes.length)],
            revealed: false,
          };
        }
      }
    }
    return map;
  },
};
