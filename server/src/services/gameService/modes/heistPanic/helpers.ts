import type { CodePad } from "@app-types/index";
import { GRID_SIZE } from "@config/constants";

export const heistPanicHelpers = {
  generateCodePads: (playerCount: number): CodePad[] => {
    const numPads = Math.max(3, 3 + (playerCount - 1));
    const pads: CodePad[] = [];
    const occupiedCoords = new Set<string>();
    while (pads.length < numPads) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const coordKey = `${x},${y}`;
      if (!occupiedCoords.has(coordKey)) {
        pads.push({ id: crypto.randomUUID(), x, y });
        occupiedCoords.add(coordKey);
      }
    }
    return pads;
  },
};
