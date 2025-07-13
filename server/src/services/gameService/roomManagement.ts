import type {
  Room,
  Player,
  GameEvent,
} from "@app-types/index";
import { GameMode } from "@app-types/index";
import { PLAYER_COLORS } from "@config/constants";
import { generateRoomId, createInitialGameState } from "./helpers";

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
      gameState: createInitialGameState(GameMode.TAG),
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
    if (gameMode === GameMode.MAZE_RACE || gameMode === GameMode.TRAP_RUSH) {
      room.gameState = createInitialGameState(gameMode);
    }
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
