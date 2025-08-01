import { GameMode } from "@custom-types/index";

export const GRID_SIZE = 20;
export const CELL_SIZE = 32;

// Player colors now reference CSS variables for easy theming
export const PLAYER_COLORS = [
  "hsl(var(--player-color-1-hsl))",
  "hsl(var(--player-color-2-hsl))",
  "hsl(var(--player-color-3-hsl))",
  "hsl(var(--player-color-4-hsl))",
  "hsl(var(--player-color-5-hsl))",
  "hsl(var(--player-color-6-hsl))",
  "hsl(var(--player-color-7-hsl))",
  "hsl(var(--player-color-8-hsl))",
];

export const INFECTED_COLOR = "hsl(var(--accent-hsl))";

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
      "All players start at a random position in the maze.",
      "Navigate through the passages to find the exit (green tile).",
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
  [GameMode.HEIST_PANIC]: {
    title: "How to Play: Heist Panic",
    objective: "Be the first to guess the correct code and escape the vault.",
    rules: [
      "Multiple code pads are scattered around the vault.",
      "Only one pad has the correct code.",
      "Move onto a pad and attempt to guess the code.",
      "If you guess correctly, you win!",
      "If you guess wrong, you will be stunned and unable to move for 3 seconds.",
    ],
    controls: {
      desktop: [
        "Use Arrow Keys or WASD to move.",
        "Press SPACE to guess when on a code pad.",
      ],
      mobile: [
        "Use the on-screen joystick to move.",
        "Tap the 'Attempt Guess' button when on a code pad.",
      ],
    },
  },
  [GameMode.HIDE_AND_SEEK]: {
    title: "How to Play: Hide and Seek",
    objective:
      "As a Hider, survive until the time runs out. As a Seeker, catch all Hiders.",
    rules: [
      "One player starts as the Seeker in a maze. All others are Hiders.",
      "Seekers have a 10-second head start for Hiders to hide.",
      "Hiders leave temporary footprints that only Seekers can see.",
      "When a Seeker catches a Hider, the Hider joins the Seeker team after a short delay.",
      "Hider Team wins if at least one Hider is not caught when time expires.",
      "Seeker Team wins if all Hiders are caught.",
    ],
    controls: {
      desktop: [
        "All players: Use Arrow Keys or WASD to move.",
        "Seekers: Press SPACE to briefly reveal all Hiders' locations. This has a cooldown.",
      ],
      mobile: [
        "All players: Use the on-screen joystick to move.",
        "Seekers: Tap the 'Reveal' button to find Hiders. This has a cooldown.",
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
  [GameMode.HEIST_PANIC]: {
    TIME_LIMIT: 90, // seconds
    NUM_PADS: 5,
    STUN_DURATION: 3000, // ms
  },
  [GameMode.HIDE_AND_SEEK]: {
    TIME_LIMIT: 90, // seconds
    REVEAL_COOLDOWN: 10000, // ms
  },
};

// Game Status Types
export enum GameStatus {
  NEW = "NEW",
  BETA = "BETA",
  POPULAR = "POPULAR",
  UPDATED = "UPDATED",
  FEATURED = "FEATURED",
  EXPERIMENTAL = "EXPERIMENTAL",
  COMING_SOON = "COMING_SOON",
  LIMITED_TIME = "LIMITED_TIME",
}

// Status Configuration
export interface StatusConfig {
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
  animation: string;
  priority: number;
}

export const STATUS_CONFIG: Record<GameStatus, StatusConfig> = {
  [GameStatus.NEW]: {
    label: "New",
    iconName: "StatusNewIcon",
    color: "text-on-primary",
    bgColor: "bg-warning",
    animation: "animate-pulse",
    priority: 8,
  },
  [GameStatus.BETA]: {
    label: "Beta",
    iconName: "StatusBetaIcon",
    color: "text-on-primary",
    bgColor: "bg-primary",
    animation: "animate-bounce-subtle",
    priority: 6,
  },
  [GameStatus.POPULAR]: {
    label: "Popular",
    iconName: "StatusPopularIcon",
    color: "text-on-primary",
    bgColor: "bg-accent",
    animation: "animate-glow-soft",
    priority: 4,
  },
  [GameStatus.UPDATED]: {
    label: "Updated",
    iconName: "StatusUpdatedIcon",
    color: "text-text-primary",
    bgColor: "bg-surface-200",
    animation: "animate-fade-in",
    priority: 3,
  },
  [GameStatus.FEATURED]: {
    label: "Featured",
    iconName: "StatusFeaturedIcon",
    color: "text-on-primary",
    bgColor: "bg-accent-secondary",
    animation: "animate-float",
    priority: 7,
  },
  [GameStatus.EXPERIMENTAL]: {
    label: "Experimental",
    iconName: "StatusExperimentalIcon",
    color: "text-on-primary",
    bgColor: "bg-experimental",
    animation: "animate-pulse",
    priority: 5,
  },
  [GameStatus.COMING_SOON]: {
    label: "Coming Soon",
    iconName: "StatusComingSoonIcon",
    color: "text-text-secondary",
    bgColor: "bg-surface-100",
    animation: "animate-fade-in",
    priority: 2,
  },
  [GameStatus.LIMITED_TIME]: {
    label: "Limited Time",
    iconName: "StatusLimitedTimeIcon",
    color: "text-on-primary",
    bgColor: "bg-error",
    animation: "animate-pulse",
    priority: 9,
  },
};

// Game Mode Status Configuration
export const GAME_MODE_STATUS: Partial<Record<GameMode, GameStatus[]>> = {
  [GameMode.MAZE_RACE]: [GameStatus.UPDATED],
  [GameMode.HEIST_PANIC]: [GameStatus.NEW],
  [GameMode.HIDE_AND_SEEK]: [GameStatus.NEW],
};

export const getGameModeStatus = (mode: GameMode): GameStatus | null => {
  const statuses = GAME_MODE_STATUS[mode];
  if (!statuses || statuses.length === 0) return null;
  return statuses.reduce((highest, current) =>
    STATUS_CONFIG[current].priority > STATUS_CONFIG[highest].priority
      ? current
      : highest
  );
};
