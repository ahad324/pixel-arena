import type { GameState, Trap, TrapType, Room } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GRID_SIZE, GAME_SETTINGS } from "@config/constants";
import { generateMaze } from "@utils/mazeGenerator";

export function createInitialGameState(gameMode: GameMode): GameState {
  const baseState: GameState = { status: "waiting", timer: 0, winner: null };
  switch (gameMode) {
    case GameMode.TERRITORY_CONTROL:
      baseState.tiles = Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill({ claimedBy: null, color: null }));
      break;
    case GameMode.MAZE_RACE:
      const mazeData = generateMaze(GRID_SIZE, GRID_SIZE);
      baseState.maze = { grid: mazeData.grid, end: { x: 0, y: 0 } };
      break;
    case GameMode.TRAP_RUSH:
      baseState.trapMap = generateTrapMap();
      baseState.finishLine = GRID_SIZE - 1;
      break;
    case GameMode.SPY_AND_DECODE:
      const { DECOY_CODES } = GAME_SETTINGS[GameMode.SPY_AND_DECODE];
      const shuffledCodes = [...DECOY_CODES].sort(() => 0.5 - Math.random());
      const selectedCodes = shuffledCodes.slice(0, 3);
      baseState.codes = selectedCodes.map((value, i) => ({
        id: String.fromCharCode(65 + i),
        value,
      }));
      baseState.correctCodeId =
        baseState.codes[Math.floor(Math.random() * baseState.codes.length)].id;
      baseState.phase = "signaling";
      baseState.playerGuesses = {};
      break;
  }
  return baseState;
}

export function calculateTerritoryScores(room: Room): { [id: string]: number } {
  const scores: { [id: string]: number } = {};
  room.gameState.tiles?.flat().forEach((t) => {
    if (t.claimedBy) scores[t.claimedBy] = (scores[t.claimedBy] || 0) + 1;
  });
  console.log(scores);
  return scores;
}

export function calculateDistances(
  grid: number[][],
  startX: number,
  startY: number
): number[][] {
  const distances = Array(grid.length)
    .fill(null)
    .map(() => Array(grid[0].length).fill(-1));
  if (grid[startY]?.[startX] === 1) return distances;
  const queue: { x: number; y: number; dist: number }[] = [];
  distances[startY][startX] = 0;
  queue.push({ x: startX, y: startY, dist: 0 });
  let head = 0;
  while (head < queue.length) {
    const { x, y, dist } = queue[head++]!;
    const directions = [
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
    ];
    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      if (
        ny >= 0 &&
        ny < grid.length &&
        nx >= 0 &&
        nx < grid[0].length &&
        grid[ny][nx] === 0 &&
        distances[ny][nx] === -1
      ) {
        distances[ny][nx] = dist + 1;
        queue.push({ x: nx, y: ny, dist: dist + 1 });
      }
    }
  }
  return distances;
}

export function generateTrapMap(): (Trap | null)[][] {
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
}

export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
