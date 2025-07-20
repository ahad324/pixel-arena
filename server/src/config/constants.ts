import { GameMode } from "@app-types/index";

export const GRID_SIZE = 20;
export const CELL_SIZE = 32; // in pixels

export const PLAYER_COLORS = [
  "#3B82F6", // blue-500
  "#22C55E", // green-500
  "#EC4899", // pink-500
  "#F97316", // orange-500
  "#8B5CF6", // violet-500
  "#FBBF24", // amber-400
  "#14B8A6", // teal-500
  "#EF4444", // red-500
];

export const INFECTED_COLOR = "#84CC16"; // lime-500

export const GAME_DESCRIPTIONS: Record<string, string> = {
  [GameMode.TAG]:
    "One player is 'It'. Avoid being tagged to score points. If you're tagged, you're It!",
  [GameMode.TERRITORY_CONTROL]:
    "Claim as many tiles as you can by walking over them. Most tiles in 60 seconds wins!",
  [GameMode.MAZE_RACE]:
    "Be the first to navigate the maze from start to finish. Watch out for dead ends!",
  [GameMode.INFECTION_ARENA]:
    "One player is the Virus. Evade infection or spread it. Last clean player standing wins!",
  [GameMode.TRAP_RUSH]:
    "Race to the finish line across a field of hidden traps. Watch your step!",
  [GameMode.SPY_AND_DECODE]:
    "A secret spy knows the code. They must signal it to you. Guess correctly without being caught!",
  [GameMode.HEIST_PANIC]:
    "Find the correct code pad to escape the vault. A wrong guess will stun you!",
  [GameMode.HIDE_AND_SEEK]:
    "One Seeker hunts the Hiders in a maze. Caught Hiders join the Seekers. Survive to win!",
};

export const GAME_SETTINGS = {
  [GameMode.TAG]: {
    POINT_INTERVAL: 1000, // ms
    TIME_LIMIT: 60, // seconds
  },
  [GameMode.TERRITORY_CONTROL]: {
    TIME_LIMIT: 60, // seconds
  },
  [GameMode.MAZE_RACE]: {
    // No specific settings needed here for now
  },
  [GameMode.INFECTION_ARENA]: {
    TIME_LIMIT: 60, // seconds
    SPRINT_DURATION: 1500, // ms
    SPRINT_COOLDOWN: 5000, // ms
    SHIELD_DURATION: 2000, // ms
    SHIELD_COOLDOWN: 10000, // ms
  },
  [GameMode.TRAP_RUSH]: {
    TRAP_DENSITY: 0.2, // 20% of tiles are traps
    SLOW_DURATION: 2000, // ms
    FREEZE_DURATION: 2000, // ms
    TELEPORT_DISTANCE: 5, // tiles
  },
  [GameMode.SPY_AND_DECODE]: {
    SIGNAL_TIME: 20, // seconds
    GUESS_TIME: 10, // seconds
    DECOY_CODES: ["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO"],
  },
  [GameMode.HEIST_PANIC]: {
    TIME_LIMIT: 60, // seconds
    STUN_DURATION: 3000, // ms
  },
  [GameMode.HIDE_AND_SEEK]: {
    TIME_LIMIT: 90, // seconds
    SEEKER_START_DELAY: 10000, // ms
    REVEAL_DURATION: 2000, // ms
    REVEAL_COOLDOWN: 10000, // ms
    CONVERSION_DELAY: 1000, // ms
    FOOTPRINT_FADE_DURATION: 2000, // ms
  },
};
