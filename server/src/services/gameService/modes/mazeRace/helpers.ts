import type { Room } from "@app-types/index";
import { GRID_SIZE } from "@config/constants";
import { calculateDistances } from "../../common/helpers";

export const mazeRaceHelpers = {
  setupMazeRace: (room: Room) => {
    const maze = room.gameState.maze!;
    let endX = Math.floor(GRID_SIZE / 2);
    let endY = Math.floor(GRID_SIZE / 2);
    while (maze.grid[endY]?.[endX] !== 0) {
      endX = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      endY = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    }
    maze.end = { x: endX, y: endY };
    const distances = calculateDistances(maze.grid, endX, endY);
    let maxDist = 0;
    const farthestCells: { x: number; y: number }[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (distances[y]?.[x] > maxDist) {
          maxDist = distances[y][x];
          farthestCells.length = 0;
          farthestCells.push({ x, y });
        } else if (distances[y]?.[x] === maxDist) {
          farthestCells.push({ x, y });
        }
      }
    }
    const shuffledStarts = farthestCells.sort(() => 0.5 - Math.random());
    room.players.forEach((p, index) => {
      const startPos = shuffledStarts[index % shuffledStarts.length];
      if (startPos) {
        p.x = startPos.x;
        p.y = startPos.y;
      } else {
        p.x = 1;
        p.y = 1;
        while (maze.grid[p.y]?.[p.x] === 1) {
          p.x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
          p.y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        }
      }
      p.score = 0;
      p.isEliminated = false;
      p.isIt = false;
    });
  },
};