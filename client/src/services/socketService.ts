

import { io, Socket } from "socket.io-client";
import type { Room, Player, GameMode } from "../types";

class SocketService {
  private socket: Socket | null = null;

  public connect() {
    if (!this.socket) {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      this.socket = io(backendUrl, {
        transports: ["websocket"],
        secure: true,
      });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // --- Room Management ---
  public createRoom(
    user: Omit<Player, "socketId">,
    gameMode: GameMode,
    callback: (room: Room) => void
  ) {
    this.socket?.emit("create-room", { user, gameMode }, (room: Room) => {
      callback(room);
    });
  }

  public joinRoom(
    roomId: string,
    user: Omit<Player, "socketId">,
    callback: (res: { room: Room | null; error?: string }) => void
  ) {
    this.socket?.emit("join-room", { roomId, user }, callback);
  }

  public setGameMode(roomId: string, gameMode: GameMode) {
    this.socket?.emit("set-game-mode", { roomId, gameMode });
  }

  public leaveRoom(roomId: string, playerId: string) {
    this.socket?.emit("leave-room", { roomId, playerId });
  }

  public getAvailableRooms() {
    this.socket?.emit("get-available-rooms");
  }

  // --- Real-time Subscriptions ---
  public onAvailableRoomsUpdate(
    callback: (
      rooms: { id: string; gameMode: GameMode; playerCount: number }[]
    ) => void
  ) {
    this.socket?.on("available-rooms-update", callback);
  }

  public offAvailableRoomsUpdate() {
    this.socket?.off("available-rooms-update");
  }

  public onRoomUpdate(callback: (room: Room) => void) {
    this.socket?.on("room-update", callback);
  }

  public offRoomUpdate() {
    this.socket?.off("room-update");
  }

  // --- Player Actions ---
  public updatePlayerPosition(
    roomId: string,
    playerId: string,
    newPos: { x: number; y: number }
  ) {
    this.socket?.emit("player-move", { roomId, playerId, newPos });
  }

  public activateAbility(roomId: string, playerId: string) {
    this.socket?.emit("player-ability", { roomId, playerId });
  }

  public submitGuess(roomId: string, playerId: string, guess: string) {
    this.socket?.emit("player-guess", { roomId, playerId, guess });
  }

  // --- Game Logic ---
  public startGame(roomId: string, playerId: string) {
    this.socket?.emit("start-game", { roomId, playerId });
  }
}

export const socketService = new SocketService();