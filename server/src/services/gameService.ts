import type {
  Room,
  Player,
  GameState,
  Trap,
  TrapType,
} from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GRID_SIZE, PLAYER_COLORS, GAME_SETTINGS } from "@config/constants";
import { generateMaze } from "@utils/mazeGenerator";

type NotifyCallback = (roomId: string, room: Room) => void;

class GameService {
  private rooms: Map<string, Room> = new Map();
  private gameIntervals: Map<string, ReturnType<typeof setInterval>[]> =
    new Map();

  // --- Room Management ---

  public createRoom(hostPlayer: Player): Room {
    const roomId = this.generateRoomId();
    const hostWithColor = {
      ...hostPlayer,
      color: PLAYER_COLORS[0],
      x: 1,
      y: 1,
    };

    const newRoom: Room = {
      id: roomId,
      hostId: hostPlayer.id,
      gameMode: GameMode.TAG, // Default, will be set on join
      players: [hostWithColor],
      gameState: this.createInitialGameState(GameMode.TAG),
    };

    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  public joinRoom(roomId: string, player: Player): Room | null {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= PLAYER_COLORS.length) return null;

    const playerWithColor = {
      ...player,
      color: PLAYER_COLORS[room.players.length % PLAYER_COLORS.length],
      x: 1,
      y: 1,
    };

    room.players.push(playerWithColor);
    return room;
  }

  public setGameMode(roomId: string, gameMode: GameMode): Room | null {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState.status !== "waiting") return null;
    room.gameMode = gameMode;
    // Re-initialize game state for the new mode if it requires pre-generated content like a maze
    if (gameMode === GameMode.MAZE_RACE) {
      room.gameState = this.createInitialGameState(gameMode);
    }
    return room;
  }

  public leaveRoom(
    roomId: string,
    playerId: string
  ): { updatedRoom: Room | null; roomWasDeleted: boolean } {
    const room = this.rooms.get(roomId);
    if (!room) return { updatedRoom: null, roomWasDeleted: true };

    room.players = room.players.filter((p) => p.id !== playerId);

    if (room.players.length === 0) {
      this.clearGameIntervals(roomId);
      this.rooms.delete(roomId);
      return { updatedRoom: null, roomWasDeleted: true };
    }

    if (room.hostId === playerId) {
      room.hostId = room.players[0].id;
    }
    return { updatedRoom: room, roomWasDeleted: false };
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
      .filter((room) => room.gameState.status === "waiting")
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
  ): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState.status !== "playing") return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.isEliminated) return;

    const now = Date.now();
    if (player.effects?.some((e) => e.type === "frozen" && e.expires > now))
      return;

    if (
      newPos.x < 0 ||
      newPos.x >= GRID_SIZE ||
      newPos.y < 0 ||
      newPos.y >= GRID_SIZE
    ) {
      return;
    }

    const isSlowed = player.effects?.some(
      (e) => e.type === "slow" && e.expires > now
    );
    const isSprinting =
      player.isInfected && player.sprintUntil && now < player.sprintUntil;

    let moveCooldown = isSprinting ? 50 : isSlowed ? 250 : 100;

    if (player.lastMoveTime && now - player.lastMoveTime < moveCooldown) return;
    player.lastMoveTime = now;

    if (
      room.gameMode === GameMode.MAZE_RACE &&
      room.gameState.maze?.grid[newPos.y]?.[newPos.x] === 1
    ) {
      return;
    }

    player.x = newPos.x;
    player.y = newPos.y;

    this.runMoveLogic(room, player);

    return room;
  }

  public activateAbility(roomId: string, playerId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState.status !== "playing") return;
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

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
        }
      } else {
        if (
          !player.lastShieldTime ||
          now - player.lastShieldTime > settings.SHIELD_COOLDOWN
        ) {
          player.lastShieldTime = now;
          player.shieldUntil = now + settings.SHIELD_DURATION;
        }
      }
    }
    return room;
  }

  public submitGuess(
    roomId: string,
    playerId: string,
    guess: string
  ): Room | undefined {
    const room = this.rooms.get(roomId);
    if (
      !room ||
      room.gameState.status !== "playing" ||
      room.gameMode !== GameMode.SPY_AND_DECODE ||
      room.gameState.phase !== "guessing"
    )
      return;
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

    if (!room.gameState.playerGuesses) room.gameState.playerGuesses = {};
    room.gameState.playerGuesses[playerId] = guess;
    player.guess = guess;
    return room;
  }

  // --- Game Logic ---

  public startGame(
    roomId: string,
    playerId: string,
    notifyCallback: NotifyCallback
  ): Room | undefined {
    const room = this.rooms.get(roomId);
    if (
      !room ||
      room.hostId !== playerId ||
      room.gameState.status !== "waiting"
    )
      return;

    this.clearGameIntervals(roomId);
    // For most games, re-creating the state is fine. Maze Race has specific logic in initializeGameMode.
    if (room.gameMode !== GameMode.MAZE_RACE) {
      room.gameState = this.createInitialGameState(room.gameMode);
    }
    room.gameState.status = "playing";
    room.players.forEach((p) => {
      p.score = 0;
      p.isEliminated = false;
      p.isIt = false;
      p.effects = [];
      p.isInfected = false;
      p.isSpy = false;
      p.guess = null;

      // Initial positions for non-maze games. Maze positions are set in initializeGameMode.
      if (room.gameMode === GameMode.TRAP_RUSH) {
        p.x = Math.floor(Math.random() * GRID_SIZE);
        p.y = 0;
      } else if (room.gameMode !== GameMode.MAZE_RACE) {
        p.x = Math.floor(Math.random() * GRID_SIZE);
        p.y = Math.floor(Math.random() * GRID_SIZE);
      }
    });

    this.initializeGameMode(room, notifyCallback);
    return room;
  }

  private runMoveLogic(room: Room, player: Player) {
    switch (room.gameMode) {
      case GameMode.TAG:
        if (player.isIt) {
          const taggedPlayer = room.players.find(
            (p) => !p.isIt && p.x === player.x && p.y === player.y
          );
          if (taggedPlayer) {
            player.isIt = false;
            taggedPlayer.isIt = true;
          }
        }
        break;
      case GameMode.TERRITORY_CONTROL:
        if (room.gameState.tiles) {
          room.gameState.tiles[player.y][player.x] = {
            claimedBy: player.id,
            color: player.color,
          };
        }
        break;
      case GameMode.MAZE_RACE:
        if (
          player.x === room.gameState.maze?.end.x &&
          player.y === room.gameState.maze?.end.y
        ) {
          this.endGame(room, player);
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
            if (room.players.every((p) => p.isInfected)) {
              this.endGame(room);
            }
          }
        }
        break;
      case GameMode.TRAP_RUSH:
        if (player.y >= room.gameState.finishLine!) {
          this.endGame(room, player);
          return;
        }
        const trap = room.gameState.trapMap?.[player.y]?.[player.x];
        if (trap && !trap.revealed) {
          trap.revealed = true;
          const now = Date.now();
          const settings = GAME_SETTINGS[GameMode.TRAP_RUSH];
          if (!player.effects) player.effects = [];
          switch (trap.type) {
            case "freeze":
              player.effects.push({
                type: "frozen",
                expires: now + settings.FREEZE_DURATION,
              });
              break;
            case "slow":
              player.effects.push({
                type: "slow",
                expires: now + settings.SLOW_DURATION,
              });
              break;
            case "teleport":
              player.y = Math.max(0, player.y - settings.TELEPORT_DISTANCE);
              break;
          }
        }
        break;
    }
  }

  private initializeGameMode(room: Room, notify: NotifyCallback) {
    const intervals: ReturnType<typeof setInterval>[] = [];

    const createInterval = (callback: () => void, delay: number) => {
      const interval = setInterval(() => {
        if (!this.rooms.has(room.id)) {
          clearInterval(interval);
          return;
        }
        callback();
        notify(room.id, room);
      }, delay);
      intervals.push(interval);
    };

    switch (room.gameMode) {
      case GameMode.TAG:
        const tagSettings = GAME_SETTINGS[GameMode.TAG];
        room.gameState.timer = tagSettings.TIME_LIMIT;
        room.players[Math.floor(Math.random() * room.players.length)].isIt =
          true;

        createInterval(() => {
          if (room.gameState.status !== "playing") return;
          room.players.forEach((p) => {
            if (!p.isIt && !p.isEliminated) p.score += 1;
          });
        }, tagSettings.POINT_INTERVAL);

        createInterval(() => {
          if (room.gameState.status !== "playing") return;
          room.gameState.timer -= 1;
          if (room.gameState.timer <= 0) {
            this.endGame(room);
          }
        }, 1000);
        break;
      case GameMode.TERRITORY_CONTROL:
        room.gameState.timer =
          GAME_SETTINGS[GameMode.TERRITORY_CONTROL].TIME_LIMIT;
        createInterval(() => {
          room.gameState.timer -= 1;
          if (room.gameState.timer <= 0) this.endGame(room);
        }, 1000);
        break;
      case GameMode.MAZE_RACE:
        const maze = room.gameState.maze!;

        // 1. Find a valid end point near the center
        let endX = Math.floor(GRID_SIZE / 2);
        let endY = Math.floor(GRID_SIZE / 2);
        while (maze.grid[endY]?.[endX] !== 0) {
          endX = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
          endY = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        }
        maze.end = { x: endX, y: endY };

        // 2. Calculate distances from the end point using BFS
        const distances = this.calculateDistances(maze.grid, endX, endY);

        // 3. Find the farthest points
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

        // 4. Assign players to these starting points
        const shuffledStarts = farthestCells.sort(() => 0.5 - Math.random());
        room.players.forEach((p, index) => {
          const startPos = shuffledStarts[index % shuffledStarts.length];
          if (startPos) {
            p.x = startPos.x;
            p.y = startPos.y;
          } else {
            // Fallback if no fair start points found
            p.x = 1;
            p.y = 1;
            while (maze.grid[p.y]?.[p.x] === 1) {
              p.x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
              p.y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
            }
          }
        });
        break;
      case GameMode.INFECTION_ARENA:
        room.players[
          Math.floor(Math.random() * room.players.length)
        ].isInfected = true;
        room.gameState.timer =
          GAME_SETTINGS[GameMode.INFECTION_ARENA].TIME_LIMIT;
        createInterval(() => {
          const now = Date.now();
          room.gameState.timer -= 1;
          room.players.forEach((p) => {
            if (p.shieldUntil && now > p.shieldUntil) p.shieldUntil = undefined;
            if (p.sprintUntil && now > p.sprintUntil) p.sprintUntil = undefined;
          });
          if (room.gameState.timer <= 0) this.endGame(room);
        }, 1000);
        break;
      case GameMode.TRAP_RUSH:
        createInterval(() => {
          const now = Date.now();
          room.players.forEach((p) => {
            p.effects = p.effects?.filter((e) => e.expires > now);
          });
        }, 500);
        break;
      case GameMode.SPY_AND_DECODE:
        room.gameState.phase = "signaling";
        room.gameState.timer =
          GAME_SETTINGS[GameMode.SPY_AND_DECODE].SIGNAL_TIME;
        createInterval(() => {
          room.gameState.timer -= 1;
          if (room.gameState.timer <= 0) {
            if (room.gameState.phase === "signaling") {
              room.gameState.phase = "guessing";
              room.gameState.timer =
                GAME_SETTINGS[GameMode.SPY_AND_DECODE].GUESS_TIME;
            } else if (room.gameState.phase === "guessing") {
              this.endGame(room);
            }
          }
        }, 1000);
        break;
      case GameMode.DODGE_THE_SPIKES:
        const spawner = setInterval(() => {
          if (!this.rooms.has(room.id)) {
            clearInterval(spawner);
            return;
          }
          room.gameState.spikes?.push({
            id: crypto.randomUUID(),
            x: Math.floor(Math.random() * GRID_SIZE),
            y: 0,
          });
        }, GAME_SETTINGS[GameMode.DODGE_THE_SPIKES].SPIKE_SPAWN_RATE);

        const mover = setInterval(() => {
          if (!this.rooms.has(room.id)) {
            clearInterval(mover);
            return;
          }
          const spikes = room.gameState.spikes || [];
          for (let i = spikes.length - 1; i >= 0; i--) {
            spikes[i].y += 1;
            if (spikes[i].y >= GRID_SIZE) spikes.splice(i, 1);
          }
          room.players.forEach((p) => {
            if (
              !p.isEliminated &&
              spikes.some((s) => s.x === p.x && s.y === p.y)
            )
              p.isEliminated = true;
          });

          const active = room.players.filter((p) => !p.isEliminated);
          if (active.length <= 1 && room.players.length > 1)
            this.endGame(room, active[0] || null);
          else if (active.length === 0 && room.players.length > 0)
            this.endGame(room, null);

          notify(room.id, room);
        }, GAME_SETTINGS[GameMode.DODGE_THE_SPIKES].SPIKE_MOVE_RATE);
        intervals.push(spawner, mover);
        break;
    }
    this.gameIntervals.set(room.id, intervals);
  }

  private endGame(room: Room, winner: Player | null = null) {
    this.clearGameIntervals(room.id);
    room.gameState.status = "finished";

    if (winner) {
      room.gameState.winner = winner;
      const winnerInRoom = room.players.find((p) => p.id === winner.id);
      if (winnerInRoom) winnerInRoom.score += 1;
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
            room.players
              .filter((p) => p.isInfected)
              .forEach((p) => (p.score += 1));
          } else {
            room.gameState.winner = { name: "Survivors" };
            survivors.forEach((p) => (p.score += 1));
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
            room.gameState.winner = correctGuessers[0];
          } else {
            room.gameState.winner = { name: "No one found the code!" };
          }
          break;
      }
    }
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
        baseState.maze = { grid: mazeData.grid, end: mazeData.end };
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
    if (grid[startY]?.[startX] === 1) return distances; // Start is in a wall

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

  private clearGameIntervals(roomId: string) {
    this.gameIntervals.get(roomId)?.forEach(clearInterval);
    this.gameIntervals.delete(roomId);
  }
}

export const gameService = new GameService();
