import type { Room, Player, GameEvent } from "@app-types/index";
import { generateRoomId, createInitialGameState } from "./common/helpers";
import { GRID_SIZE } from "@config/constants";
import { GameMode } from "@app-types/index";
import { PLAYER_COLORS } from "@config/constants";
import { tagLogic } from "./modes/tag";
import { territoryControlLogic } from "./modes/teritorryControl";
import { mazeRaceLogic } from "./modes/mazeRace";
import { infectionArenaLogic } from "./modes/infectionArena";
import { trapRushLogic } from "./modes/trapRush";
import { spyAndDecodeLogic } from "./modes/spyAndDecode";
import { heistPanicLogic } from "./modes/heistPanic";

export const roomManagement = {
  createRoom: (rooms: Map<string, Room>, hostPlayer: Player): Room => {
    const roomId = generateRoomId();
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
      gameState: createInitialGameState(GameMode.TAG, 1),
    };

    rooms.set(roomId, newRoom);
    return newRoom;
  },

  joinRoom: (
    rooms: Map<string, Room>,
    roomId: string,
    player: Player
  ): Room | null => {
    const room = rooms.get(roomId);
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
  },

  setGameMode: (
    rooms: Map<string, Room>,
    roomId: string,
    gameMode: GameMode
  ): GameEvent[] => {
    const room = rooms.get(roomId);
    if (!room || room.gameState.status !== "waiting") return [];
    room.gameMode = gameMode;
    room.gameState = createInitialGameState(gameMode, room.players.length);
    return [
      {
        name: "game-mode-changed",
        data: { gameMode, gameState: room.gameState },
      },
    ];
  },

  leaveRoom: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string
  ): { events: GameEvent[]; roomWasDeleted: boolean; updatedRoom?: Room } => {
    const room = rooms.get(roomId);
    if (!room) return { events: [], roomWasDeleted: true };

    const wasHost = room.hostId === playerId;
    room.players = room.players.filter((p) => p.id !== playerId);

    if (room.players.length === 0) {
      rooms.delete(roomId);
      return { events: [], roomWasDeleted: true };
    }

    const events: GameEvent[] = [{ name: "player-left", data: { playerId } }];
    if (wasHost) {
      room.hostId = room.players[0].id;
      events.push({ name: "host-changed", data: { newHostId: room.hostId } });
    }
    return { events, roomWasDeleted: false, updatedRoom: room };
  },

  getRoom: (rooms: Map<string, Room>, roomId: string): Room | undefined => {
    return rooms.get(roomId);
  },

  getAvailableRooms: (
    rooms: Map<string, Room>
  ): { id: string; gameMode: GameMode; playerCount: number }[] => {
    return Array.from(rooms.values())
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
  },
};

export const playerActions = {
  updatePlayerPosition: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string,
    newPos: { x: number; y: number }
  ): GameEvent[] => {
    const room = rooms.get(roomId);
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

    // Delegate to game mode specific move logic
    switch (room.gameMode) {
      case GameMode.TAG:
        return tagLogic.handleMove(room, player, newPos);
      case GameMode.TERRITORY_CONTROL:
        return territoryControlLogic.handleMove(room, player, newPos);
      case GameMode.MAZE_RACE:
        return mazeRaceLogic.handleMove(room, player, newPos);
      case GameMode.INFECTION_ARENA:
        return infectionArenaLogic.handleMove(room, player, newPos);
      case GameMode.TRAP_RUSH:
        return trapRushLogic.handleMove(room, player, newPos);
      case GameMode.SPY_AND_DECODE:
        return spyAndDecodeLogic.handleMove(room, player, newPos);
      case GameMode.HEIST_PANIC:
        return heistPanicLogic.handleMove(room, player, newPos);
    }
    return events;
  },

  activateAbility: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string
  ): GameEvent[] => {
    const room = rooms.get(roomId);
    if (!room || room.gameState.status !== "playing") return [];
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return [];

    switch (room.gameMode) {
      case GameMode.INFECTION_ARENA:
        return infectionArenaLogic.handleAbility(room, player);
      default:
        return [];
    }
  },

  submitGuess: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string,
    guess: string
  ): GameEvent[] => {
    return spyAndDecodeLogic.handleGuess(rooms, roomId, playerId, guess);
  },

  submitHeistGuess: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string,
    padId: string
  ): GameEvent[] => {
    return heistPanicLogic.handleGuess(rooms, roomId, playerId, padId);
  },
};
