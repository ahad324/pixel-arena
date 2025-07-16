import { GameMode } from "../types";

export const GRID_SIZE = 20;

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
};

export interface GameInstruction {
  title: string;
  objective: string;
  rules: string[];
  controls: {
    desktop: string[];
    mobile: string[];
  };
}

export const GAME_INSTRUCTIONS: Record<GameMode, GameInstruction> = {
  [GameMode.TAG]: {
    title: "How to Play: Tag",
    objective:
      "Earn points by avoiding being 'It'. The player with the most points at the end wins.",
    rules: [
      "One player is randomly chosen to be 'It' at the start.",
      "If you are 'It', your goal is to tag another player by moving onto their square.",
      "When you tag someone, they become 'It', and you are safe.",
      "Players who are not 'It' earn points for every second they remain untagged.",
    ],
    controls: {
      desktop: ["Use Arrow Keys or WASD to move your character."],
      mobile: ["Use the on-screen joystick to move your character."],
    },
  },
  [GameMode.TERRITORY_CONTROL]: {
    title: "How to Play: Territory Control",
    objective: "Claim the most tiles for your color within the time limit.",
    rules: [
      "Move your character to paint the tiles on the grid with your color.",
      "You can claim uncolored tiles or steal tiles from other players by moving over them.",
      "The player who has claimed the most tiles when the 60-second timer runs out is the winner.",
    ],
    controls: {
      desktop: ["Use Arrow Keys or WASD to move your character."],
      mobile: ["Use the on-screen joystick to move your character."],
    },
  },
  [GameMode.MAZE_RACE]: {
    title: "How to Play: Maze Race",
    objective: "Be the first player to reach the green exit of the maze.",
    rules: [
      "All players start at the same position in the maze.",
      "Navigate through the passages to find the exit.",
      "You cannot move through the dark gray walls of the maze.",
      "The first player to touch the green exit wins the round.",
    ],
    controls: {
      desktop: ["Use Arrow Keys or WASD to move your character."],
      mobile: ["Use the on-screen joystick to move your character."],
    },
  },
  [GameMode.INFECTION_ARENA]: {
    title: "How to Play: Infection Arena",
    objective:
      "As a Survivor, avoid infection until time runs out. As the Virus, infect all Survivors.",
    rules: [
      "One player starts as the 'Virus' (infected), and all others are 'Survivors'.",
      "Virus Win Condition: Infect every other player.",
      "Survivor Win Condition: At least one survivor must remain uninfected when the timer ends.",
    ],
    controls: {
      desktop: [
        "Survivors: Press SPACE to activate a temporary shield that blocks infection.",
        "Virus: Press SPACE to use a short-duration sprint to catch Survivors.",
        "Both abilities have a cooldown period after use.",
      ],
      mobile: [
        "Survivors: Tap the 'Use Shield' button to block infection.",
        "Virus: Tap the 'Use Sprint' button for a burst of speed.",
        "Both abilities have a cooldown period after use.",
      ],
    },
  },
  [GameMode.TRAP_RUSH]: {
    title: "How to Play: Trap Rush",
    objective:
      "Be the first player to cross the checkered finish line at the bottom of the grid.",
    rules: [
      "The grid is filled with hidden traps that are revealed when you step on them.",
      "❄️ Freeze Trap: Freezes you in place for a few seconds.",
      "🌀 Teleport Trap: Instantly sends you back several rows.",
      "🐌 Slow Trap: Reduces your movement speed for a few seconds.",
      "Plan your path carefully and be wary of where other players have gone!",
    ],
    controls: {
      desktop: ["Use Arrow Keys or WASD to move your character."],
      mobile: ["Use the on-screen joystick to move your character."],
    },
  },
  [GameMode.SPY_AND_DECODE]: {
    title: "How to Play: Spy & Decode",
    objective:
      "As an Agent, identify the secret code. As the Spy, trick the Agents.",
    rules: [
      "One player is secretly the 'Spy'; all others are 'Agents'.",
      "The Spy is shown the correct code. During the 'Signaling Phase', the Spy must use their movement to give clues.",
      "During the 'Guessing Phase', all players vote for the code they think is correct.",
      "The Agents win if at least one Agent guesses the code correctly.",
      "The Spy wins if NO Agents guess correctly, proving their deception was successful.",
    ],
    controls: {
      desktop: [
        "Use Arrow Keys or WASD to move during the signaling phase. Use your mouse to click your guess.",
      ],
      mobile: [
        "Use the on-screen joystick to move during the signaling phase. Tap your guess on the screen.",
      ],
    },
  },
};

export const GAME_SETTINGS = {
  [GameMode.TAG]: {
    POINT_INTERVAL: 1000, // ms
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
};
