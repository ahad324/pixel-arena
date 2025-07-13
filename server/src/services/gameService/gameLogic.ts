import type { Room, Player, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GRID_SIZE, GAME_SETTINGS } from "@config/constants";
import {
  calculateDistances,
  createInitialGameState,
  calculateTerritoryScores,
} from "./helpers";

export const gameLogic = {
  startGame: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string
  ): { room: Room | undefined; events: GameEvent[] } => {
    const room = rooms.get(roomId);
    if (
      !room ||
      room.hostId !== playerId ||
      room.gameState.status !== "waiting"
    )
      return { room: undefined, events: [] };

    room.gameState = createInitialGameState(room.gameMode);
    initializeGameMode(room);

    return { room, events: [{ name: "game-started", data: { room } }] };
  },
};

export function runMoveLogic(room: Room, player: Player): GameEvent[] {
  const events: GameEvent[] = [];
  switch (room.gameMode) {
    case GameMode.TAG:
      if (player.isIt) {
        const taggedPlayer = room.players.find(
          (p) => !p.isIt && p.x === player.x && p.y === player.y
        );
        if (taggedPlayer) {
          player.isIt = false;
          taggedPlayer.isIt = true;
          events.push({
            name: "player-tagged",
            data: { oldIt: player.id, newIt: taggedPlayer.id },
          });
        }
      }
      break;
    case GameMode.TERRITORY_CONTROL:
      if (
        room.gameState.tiles &&
        room.gameState.tiles[player.y][player.x].claimedBy !== player.id
      ) {
        // paint the tile
        room.gameState.tiles[player.y][player.x] = {
          claimedBy: player.id,
          color: player.color,
        };
        events.push({
          name: "tile-claimed",
          data: {
            x: player.x,
            y: player.y,
            playerId: player.id,
            color: player.color,
          },
        });

        // NEW ➜ recompute scores and broadcast
        const scores = calculateTerritoryScores(room);
        room.players.forEach((p) => (p.score = scores[p.id] || 0));
        events.push({
          name: "scores-update",
          data: {
            scores: room.players.map((p) => ({ id: p.id, score: p.score })),
          },
        });
      }
      break;
    case GameMode.MAZE_RACE:
      if (
        player.x === room.gameState.maze?.end.x &&
        player.y === room.gameState.maze?.end.y
      ) {
        events.push(...endGame(room, player));
      }
      break;
    case GameMode.INFECTION_ARENA:
      if (player.isInfected) {
        const now = Date.now();
        const caughtPlayer = room.players.find(
          (p) => !p.isInfected && p.x === player.x && p.y === player.y
        );
        if (
          caughtPlayer &&
          !(caughtPlayer.shieldUntil && now < caughtPlayer.shieldUntil)
        ) {
          caughtPlayer.isInfected = true;
          events.push({
            name: "player-infected",
            data: { playerId: caughtPlayer.id },
          });
          if (room.players.filter((p) => !p.isInfected).length === 0) {
            events.push(...endGame(room));
          }
        }
      }
      break;
    case GameMode.TRAP_RUSH:
      if (player.y >= room.gameState.finishLine!) {
        events.push(...endGame(room, player));
        return events;
      }
      const trap = room.gameState.trapMap?.[player.y]?.[player.x];
      if (trap && !trap.revealed) {
        trap.revealed = true;
        events.push({
          name: "trap-triggered",
          data: { x: player.x, y: player.y, type: trap.type },
        });
        const now = Date.now();
        const settings = GAME_SETTINGS[GameMode.TRAP_RUSH];
        if (!player.effects) player.effects = [];

        let effectType: "frozen" | "slow" | "teleport" | null = null;
        let effectDuration = 0;

        switch (trap.type) {
          case "freeze":
            effectDuration = settings.FREEZE_DURATION;
            effectType = "frozen";
            break;
          case "slow":
            effectDuration = settings.SLOW_DURATION;
            effectType = "slow";
            break;
          case "teleport":
            player.y = Math.max(0, player.y - settings.TELEPORT_DISTANCE);
            effectType = "teleport";
            break;
        }
        if (effectType && effectType !== "teleport") {
          const expires = now + effectDuration;
          player.effects.push({
            type: effectType as "frozen" | "slow",
            expires,
          });
          events.push({
            name: "player-effect",
            data: { playerId: player.id, type: effectType, expires },
          });
        } else if (effectType === "teleport") {
          events.push({
            name: "player-moved",
            data: { playerId: player.id, x: player.x, y: player.y },
          });
        }
      }
      break;
  }
  return events;
}

function initializeGameMode(room: Room) {
  room.gameState.status = "playing";
  room.players.forEach((p) => {
    p.score = 0;
    p.isEliminated = false;
    p.isIt = false;
    p.effects = [];
    p.isInfected = false;
    p.isSpy = false;
    p.guess = null;

    if (room.gameMode === GameMode.TRAP_RUSH) {
      p.x = Math.floor(Math.random() * GRID_SIZE);
      p.y = 0;
    } else if (room.gameMode !== GameMode.MAZE_RACE) {
      p.x = Math.floor(Math.random() * GRID_SIZE);
      p.y = Math.floor(Math.random() * GRID_SIZE);
    }
  });

  switch (room.gameMode) {
    case GameMode.TAG:
      room.gameState.timer = GAME_SETTINGS[GameMode.TAG].TIME_LIMIT;
      room.players[Math.floor(Math.random() * room.players.length)].isIt = true;
      break;
    case GameMode.TERRITORY_CONTROL:
      room.gameState.timer =
        GAME_SETTINGS[GameMode.TERRITORY_CONTROL].TIME_LIMIT;
      break;
    case GameMode.MAZE_RACE:
      setupMazeRace(room);
      break;
    case GameMode.INFECTION_ARENA:
      room.players[Math.floor(Math.random() * room.players.length)].isInfected =
        true;
      room.gameState.timer = GAME_SETTINGS[GameMode.INFECTION_ARENA].TIME_LIMIT;
      break;
    case GameMode.SPY_AND_DECODE:
      room.gameState.phase = "signaling";
      room.gameState.timer = GAME_SETTINGS[GameMode.SPY_AND_DECODE].SIGNAL_TIME;
      if (room.players.length > 1) {
        room.players[Math.floor(Math.random() * room.players.length)].isSpy =
          true;
      } else {
        room.players[0].isSpy = true;
      }
      break;
    case GameMode.DODGE_THE_SPIKES:
      const { SPIKE_SPAWN_RATE, SPIKE_MOVE_RATE } =
        GAME_SETTINGS[GameMode.DODGE_THE_SPIKES];
      room.gameState.nextSpikeSpawnTime = Date.now() + SPIKE_SPAWN_RATE;
      room.gameState.nextSpikeMoveTime = Date.now() + SPIKE_MOVE_RATE;
      break;
  }
}

function setupMazeRace(room: Room) {
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
  });
}

export function endGame(room: Room, winner: Player | null = null): GameEvent[] {
  room.gameState.status = "finished";

  if (winner) {
    room.gameState.winner = winner;
  } else {
    switch (room.gameMode) {
      case GameMode.TAG:
        if (room.players.length > 0) {
          const tagWinner = room.players.reduce((prev, current) =>
            prev.score > current.score ? prev : current
          );
          room.gameState.winner = tagWinner;
        }
        break;
      case GameMode.TERRITORY_CONTROL: {
        const scores = calculateTerritoryScores(room);
        room.players.forEach((p) => (p.score = scores[p.id] || 0));
        const winnerId = Object.keys(scores).reduce((a, b) =>
          scores[a] > scores[b] ? a : b
        );
        room.gameState.winner =
          room.players.find((p) => p.id === winnerId) || null;
        break;
      }
      case GameMode.INFECTION_ARENA:
        const survivors = room.players.filter((p) => !p.isInfected);
        if (survivors.length === 0) {
          room.gameState.winner = { name: "The Virus" };
        } else {
          room.gameState.winner = { name: "Survivors" };
        }
        break;
      case GameMode.SPY_AND_DECODE:
        room.gameState.phase = "reveal";
        const spy = room.players.find((p) => p.isSpy);
        const correctGuessers = room.players.filter(
          (p) => p.guess === room.gameState.correctCodeId
        );
        correctGuessers.forEach((p) => (p.score += 1));
        if (
          spy &&
          correctGuessers.some((p) => !p.isSpy) &&
          correctGuessers.length < room.players.length / 2
        ) {
          spy.score += 2;
          room.gameState.winner = spy;
        } else if (correctGuessers.length > 0) {
          room.gameState.winner = { name: "The Agents" };
        } else {
          room.gameState.winner = spy || { name: "No one found the code!" };
        }
        break;
    }
  }

  return [
    {
      name: "game-over",
      data: { winner: room.gameState.winner, players: room.players },
    },
  ];
}
