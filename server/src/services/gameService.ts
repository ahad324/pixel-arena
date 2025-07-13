import type {
  Room,
  Player,
  GameState,
  Trap,
  TrapType,
  GameEvent,
} from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GRID_SIZE, PLAYER_COLORS, GAME_SETTINGS } from "@config/constants";
import { generateMaze } from "@utils/mazeGenerator";

const TICK_INTERVAL = 1000 / 20; // 50ms for a 20Hz tick rate

class GameService {
  private rooms: Map<string, Room> = new Map();

  // --- Room Management ---

  public createRoom(hostPlayer: Player): Room {
    const roomId = this.generateRoomId();
    const hostWithColor = {
      ...hostPlayer,
      color: PLAYER_COLORS[0],
      x: 1,
      y: 1,
      score: 0,
    };

    const newRoom: Room = {
      id: roomId,
      hostId: hostPlayer.id,
      gameMode: GameMode.TAG,
      players: [hostWithColor],
      gameState: this.createInitialGameState(GameMode.TAG),
    };

    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  public joinRoom(roomId: string, player: Player): Room | null {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= PLAYER_COLORS.length) return null;

    const playerWithDetails = {
      ...player,
      color: PLAYER_COLORS[room.players.length % PLAYER_COLORS.length],
      x: 1,
      y: 1,
      score: 0,
    };

    room.players.push(playerWithDetails);
    return room;
  }

  public setGameMode(roomId: string, gameMode: GameMode): GameEvent[] {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState.status !== "waiting") return [];
    room.gameMode = gameMode;
    if (gameMode === GameMode.MAZE_RACE || gameMode === GameMode.TRAP_RUSH) {
      room.gameState = this.createInitialGameState(gameMode);
    }
    return [
      {
        name: "game-mode-changed",
        data: { gameMode, gameState: room.gameState },
      },
    ];
  }

  public leaveRoom(
    roomId: string,
    playerId: string
  ): { events: GameEvent[]; roomWasDeleted: boolean; updatedRoom?: Room } {
    const room = this.rooms.get(roomId);
    if (!room) return { events: [], roomWasDeleted: true };

    const wasHost = room.hostId === playerId;
    room.players = room.players.filter((p) => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return { events: [], roomWasDeleted: true };
    }

    const events: GameEvent[] = [{ name: "player-left", data: { playerId } }];
    if (wasHost) {
      room.hostId = room.players[0].id;
      events.push({ name: "host-changed", data: { newHostId: room.hostId } });
    }
    return { events, roomWasDeleted: false, updatedRoom: room };
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public getAvailableRooms(): {
    id: string;
    gameMode: GameMode;
    playerCount: number;
  }[] {
    return Array.from(this.rooms.values())
      .filter(
        (room) =>
          room.gameState.status === "waiting" &&
          room.players.length < PLAYER_COLORS.length
      )
      .map((room) => ({
        id: room.id,
        gameMode: room.gameMode,
        playerCount: room.players.length,
      }));
  }

  // --- Player Actions ---

  public updatePlayerPosition(
    roomId: string,
    playerId: string,
    newPos: { x: number; y: number }
  ): GameEvent[] {
    const room = this.rooms.get(roomId);
    const events: GameEvent[] = [];
    if (!room || room.gameState.status !== "playing") return events;

    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.isEliminated) return events;

    const now = Date.now();
    if (player.effects?.some((e) => e.type === "frozen" && e.expires > now))
      return events;

    if (
      newPos.x < 0 ||
      newPos.x >= GRID_SIZE ||
      newPos.y < 0 ||
      newPos.y >= GRID_SIZE
    )
      return events;

    const isSlowed = player.effects?.some(
      (e) => e.type === "slow" && e.expires > now
    );
    const isSprinting =
      player.isInfected && player.sprintUntil && now < player.sprintUntil;
    const moveCooldown = isSprinting ? 50 : isSlowed ? 250 : 100;

    if (player.lastMoveTime && now - player.lastMoveTime < moveCooldown)
      return events;
    player.lastMoveTime = now;

    if (
      room.gameMode === GameMode.MAZE_RACE &&
      room.gameState.maze?.grid[newPos.y]?.[newPos.x] === 1
    )
      return events;

    player.x = newPos.x;
    player.y = newPos.y;
    events.push({
      name: "player-moved",
      data: { playerId, x: player.x, y: player.y },
    });

    events.push(...this.runMoveLogic(room, player));
    return events;
  }

  public activateAbility(roomId: string, playerId: string): GameEvent[] {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState.status !== "playing") return [];
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return [];

    const now = Date.now();
    if (room.gameMode === GameMode.INFECTION_ARENA) {
      const settings = GAME_SETTINGS[GameMode.INFECTION_ARENA];
      if (player.isInfected) {
        if (
          !player.lastSprintTime ||
          now - player.lastSprintTime > settings.SPRINT_COOLDOWN
        ) {
          player.lastSprintTime = now;
          player.sprintUntil = now + settings.SPRINT_DURATION;
          return [
            {
              name: "ability-activated",
              data: {
                playerId,
                ability: "sprint",
                expires: player.sprintUntil,
              },
            },
          ];
        }
      } else {
        if (
          !player.lastShieldTime ||
          now - player.lastShieldTime > settings.SHIELD_COOLDOWN
        ) {
          player.lastShieldTime = now;
          player.shieldUntil = now + settings.SHIELD_DURATION;
          return [
            {
              name: "ability-activated",
              data: {
                playerId,
                ability: "shield",
                expires: player.shieldUntil,
              },
            },
          ];
        }
      }
    }
    return [];
  }

  public submitGuess(
    roomId: string,
    playerId: string,
    guess: string
  ): GameEvent[] {
    const room = this.rooms.get(roomId);
    if (
      !room ||
      room.gameState.status !== "playing" ||
      room.gameMode !== GameMode.SPY_AND_DECODE ||
      room.gameState.phase !== "guessing"
    )
      return [];
    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.guess) return [];

    if (!room.gameState.playerGuesses) room.gameState.playerGuesses = {};
    room.gameState.playerGuesses[playerId] = guess;
    player.guess = guess;
    return [{ name: "player-guessed", data: { playerId, guess } }];
  }

  // --- Game Logic ---

  public startGame(
    roomId: string,
    playerId: string
  ): { room: Room | undefined; events: GameEvent[] } {
    const room = this.rooms.get(roomId);
    if (
      !room ||
      room.hostId !== playerId ||
      room.gameState.status !== "waiting"
    )
      return { room: undefined, events: [] };

    room.gameState = this.createInitialGameState(room.gameMode);
    this.initializeGameMode(room);

    return { room, events: [{ name: "game-started", data: { room } }] };
  }

  private runMoveLogic(room: Room, player: Player): GameEvent[] {
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
        }
        break;
      case GameMode.MAZE_RACE:
        if (
          player.x === room.gameState.maze?.end.x &&
          player.y === room.gameState.maze?.end.y
        ) {
          events.push(...this.endGame(room, player));
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
              events.push(...this.endGame(room));
            }
          }
        }
        break;
      case GameMode.TRAP_RUSH:
        if (player.y >= room.gameState.finishLine!) {
          events.push(...this.endGame(room, player));
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

  private initializeGameMode(room: Room) {
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
        room.players[Math.floor(Math.random() * room.players.length)].isIt =
          true;
        break;
      case GameMode.TERRITORY_CONTROL:
        room.gameState.timer =
          GAME_SETTINGS[GameMode.TERRITORY_CONTROL].TIME_LIMIT;
        break;
      case GameMode.MAZE_RACE:
        this.setupMazeRace(room);
        break;
      case GameMode.INFECTION_ARENA:
        room.players[
          Math.floor(Math.random() * room.players.length)
        ].isInfected = true;
        room.gameState.timer =
          GAME_SETTINGS[GameMode.INFECTION_ARENA].TIME_LIMIT;
        break;
      case GameMode.SPY_AND_DECODE:
        room.gameState.phase = "signaling";
        room.gameState.timer =
          GAME_SETTINGS[GameMode.SPY_AND_DECODE].SIGNAL_TIME;
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

  private setupMazeRace(room: Room) {
    const maze = room.gameState.maze!;
    let endX = Math.floor(GRID_SIZE / 2);
    let endY = Math.floor(GRID_SIZE / 2);
    while (maze.grid[endY]?.[endX] !== 0) {
      endX = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      endY = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    }
    maze.end = { x: endX, y: endY };
    const distances = this.calculateDistances(maze.grid, endX, endY);
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

  private endGame(room: Room, winner: Player | null = null): GameEvent[] {
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
        case GameMode.TERRITORY_CONTROL:
          const scores: { [playerId: string]: number } = {};
          room.gameState.tiles?.flat().forEach((tile) => {
            if (tile.claimedBy)
              scores[tile.claimedBy] = (scores[tile.claimedBy] || 0) + 1;
          });
          const winnerId = Object.keys(scores).reduce(
            (a, b) => (scores[a] > scores[b] ? a : b),
            ""
          );
          const tcWinner = room.players.find((p) => p.id === winnerId) || null;
          if (tcWinner) tcWinner.score = scores[winnerId];
          room.gameState.winner = tcWinner;
          break;
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

  // --- Game Tick ---
  public tick(): Map<string, GameEvent[]> {
    const allEvents = new Map<string, GameEvent[]>();
    const now = Date.now();

    this.rooms.forEach((room, roomId) => {
      if (room.gameState.status !== "playing") return;

      const roomEvents: GameEvent[] = [];
      const { gameState, gameMode } = room;

      // Update timers
      if (gameState.timer > 0) {
        const oldTimer = Math.ceil(gameState.timer);
        // Correctly decrement timer based on tick interval (e.g., 50ms -> 0.05s)
        gameState.timer = Math.max(0, gameState.timer - TICK_INTERVAL / 1000);
        const newTimer = Math.ceil(gameState.timer);

        // This block now correctly executes once per second
        if (newTimer < oldTimer) {
          roomEvents.push({ name: "timer-update", data: { time: newTimer } });

          // Handle once-per-second logic for different game modes
          if (gameMode === GameMode.TAG) {
            let pointsChanged = false;
            room.players.forEach((p) => {
              if (!p.isIt && !p.isEliminated) {
                p.score++;
                pointsChanged = true;
              }
            });
            if (pointsChanged) {
              roomEvents.push({
                name: "scores-update",
                data: {
                  scores: room.players.map((p) => ({
                    id: p.id,
                    score: p.score,
                  })),
                },
              });
            }
          }
        }

        if (gameState.timer <= 0) {
          if (
            gameMode === GameMode.SPY_AND_DECODE &&
            gameState.phase === "signaling"
          ) {
            gameState.phase = "guessing";
            gameState.timer = GAME_SETTINGS[GameMode.SPY_AND_DECODE].GUESS_TIME;
            roomEvents.push({
              name: "phase-changed",
              data: { phase: "guessing", timer: gameState.timer },
            });
          } else {
            roomEvents.push(...this.endGame(room));
          }
        }
      }

      // Game-specific tick logic
      switch (gameMode) {
        case GameMode.TAG:
          // Scoring logic has been moved to the timer update block to ensure it runs precisely once per second.
          break;

        case GameMode.DODGE_THE_SPIKES:
          if (now >= (gameState.nextSpikeSpawnTime ?? 0)) {
            const newSpike = {
              id: crypto.randomUUID(),
              x: Math.floor(Math.random() * GRID_SIZE),
              y: 0,
            };
            gameState.spikes?.push(newSpike);
            gameState.nextSpikeSpawnTime =
              now + GAME_SETTINGS[gameMode].SPIKE_SPAWN_RATE;
            roomEvents.push({ name: "spike-spawned", data: newSpike });
          }
          if (now >= (gameState.nextSpikeMoveTime ?? 0)) {
            const spikes = gameState.spikes || [];
            for (let i = spikes.length - 1; i >= 0; i--) {
              spikes[i].y += 1;
              if (spikes[i].y >= GRID_SIZE) {
                spikes.splice(i, 1);
              }
            }
            gameState.nextSpikeMoveTime =
              now + GAME_SETTINGS[gameMode].SPIKE_MOVE_RATE;
            roomEvents.push({
              name: "spikes-moved",
              data: { spikes: gameState.spikes },
            });

            const newlyEliminated: string[] = [];
            room.players.forEach((p) => {
              if (
                !p.isEliminated &&
                spikes.some((s) => s.x === p.x && s.y === p.y)
              ) {
                p.isEliminated = true;
                newlyEliminated.push(p.id);
              }
            });
            if (newlyEliminated.length > 0) {
              roomEvents.push({
                name: "players-eliminated",
                data: { playerIds: newlyEliminated },
              });
            }

            const active = room.players.filter((p) => !p.isEliminated);
            if (active.length <= 1 && room.players.length > 1) {
              roomEvents.push(...this.endGame(room, active[0] || null));
            } else if (active.length === 0 && room.players.length > 0) {
              roomEvents.push(...this.endGame(room, null));
            }
          }
          break;
      }

      if (roomEvents.length > 0) {
        allEvents.set(roomId, roomEvents);
      }
    });

    return allEvents;
  }

  // --- Helpers ---

  private createInitialGameState(gameMode: GameMode): GameState {
    const baseState: GameState = { status: "waiting", timer: 0, winner: null };
    switch (gameMode) {
      case GameMode.TERRITORY_CONTROL:
        baseState.tiles = Array(GRID_SIZE)
          .fill(null)
          .map(() => Array(GRID_SIZE).fill({ claimedBy: null, color: null }));
        break;
      case GameMode.MAZE_RACE:
        const mazeData = generateMaze(GRID_SIZE, GRID_SIZE);
        baseState.maze = { grid: mazeData.grid, end: { x: 0, y: 0 } }; // End is set on game start
        break;
      case GameMode.DODGE_THE_SPIKES:
        baseState.spikes = [];
        break;
      case GameMode.TRAP_RUSH:
        baseState.trapMap = this.generateTrapMap();
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
          baseState.codes[
            Math.floor(Math.random() * baseState.codes.length)
          ].id;
        baseState.phase = "signaling";
        baseState.playerGuesses = {};
        break;
    }
    return baseState;
  }

  private calculateDistances(
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

  private generateTrapMap(): (Trap | null)[][] {
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

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

export const gameService = new GameService();
