export enum GameMode {
  TAG = "Tag",
  TERRITORY_CONTROL = "Territory Control",
  MAZE_RACE = "Maze Race",
  INFECTION_ARENA = "Infection Arena",
  TRAP_RUSH = "Trap Rush",
  SPY_AND_DECODE = "Spy & Decode",
  HEIST_PANIC = "Heist Panic",
  HIDE_AND_SEEK = "Hide and Seek",
}

export type TrapType = "slow" | "teleport" | "freeze";

export interface Trap {
  type: TrapType;
  revealed: boolean;
}

export interface PlayerEffect {
  type: "slow" | "frozen";
  expires: number;
}

export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  score: number;
  socketId: string;
  isIt: boolean;
  isEliminated: boolean;
  // Infection Arena
  isInfected?: boolean;
  isShielded?: boolean;
  shieldUntil?: number;
  sprintUntil?: number;
  lastShieldTime?: number;
  lastSprintTime?: number;
  // Trap Rush & Heist Panic
  effects?: PlayerEffect[];
  lastMoveTime?: number;
  // Spy & Decode
  isSpy?: boolean;
  guess?: string | null;
  // Hide and Seek
  isSeeker?: boolean;
  isCaught?: boolean;
  lastRevealTime?: number;
  conversionTime?: number;
}

export interface Tile {
  claimedBy: string | null;
  color: string | null;
}

export enum MazeRaceDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
}

export interface Maze {
  grid: number[][]; // 0 for path, 1 for wall
  end: { x: number; y: number };
  difficulty?: MazeRaceDifficulty;
}

export type GameStatus = "waiting" | "playing" | "finished";

export interface CodePad {
  id: string;
  x: number;
  y: number;
}

export interface Footprint {
  x: number;
  y: number;
  timestamp: number;
  playerId: string;
}

export interface GameState {
  status: GameStatus;
  timer: number;
  winner: Player | { name: string } | null;
  tiles?: Tile[][];
  maze?: Maze;
  // Trap Rush
  trapMap?: (Trap | null)[][];
  finishLine?: number;
  // Spy & Decode
  phase?: "signaling" | "guessing" | "reveal";
  codes?: { id: string; value: string }[];
  correctCodeId?: string;
  playerGuesses?: Record<string, string>;
  // Heist Panic
  codePads?: CodePad[];
  correctPadId?: string;
  // Hide and Seek
  seekerFreezeUntil?: number;
  footprints?: Footprint[];
}

export interface Room {
  id: string;
  hostId: string;
  gameMode: GameMode;
  players: Player[];
  gameState: GameState;
  // Maze Race specific settings
  mazeRaceSettings?: {
    difficulty: MazeRaceDifficulty;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  message: string;
  timestamp: number;
}

export interface LegacyReaction {
  emoji: string;
}

export interface Emoji {
  emoji: string;
  hexcode: string;
  group: string;
  subgroup: string;
  annotation: string;
  tags: string[];
}

export interface EmojiGroup {
  name: string;
  emojis: Emoji[];
}