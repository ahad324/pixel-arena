import { io, Socket } from "socket.io-client";
import type { Room, Player, GameMode, GameState, Spike } from "../types";

class SocketService {
  private socket: Socket | null = null;

  public connect() {
    if (!this.socket) {
      const backendUrl =
        (import.meta as any).env.VITE_BACKEND_URL || "http://localhost:3000";
      this.socket = io(backendUrl, {
        transports: ["websocket"],
      });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // --- Emitters ---
  public createRoom(
    user: Omit<Player, "socketId">,
    gameMode: GameMode,
    callback: (room: Room) => void
  ) {
    this.socket?.emit("create-room", { user, gameMode }, callback);
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

  public leaveRoom() {
    this.socket?.emit("leave-room");
  }

  public getAvailableRooms() {
    this.socket?.emit("get-available-rooms");
  }

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

  public startGame(roomId: string, playerId: string) {
    this.socket?.emit("start-game", { roomId, playerId });
  }

  // --- Listeners ---
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

  public onGameStarted(callback: (data: { room: Room }) => void) {
    this.socket?.on("game-started", callback);
  }

  public onPlayerMoved(
    callback: (data: { playerId: string; x: number; y: number }) => void
  ) {
    this.socket?.on("player-moved", callback);
  }

  public onPlayerTagged(
    callback: (data: { oldIt: string; newIt: string }) => void
  ) {
    this.socket?.on("player-tagged", callback);
  }

  public onTileClaimed(
    callback: (data: {
      x: number;
      y: number;
      playerId: string;
      color: string;
    }) => void
  ) {
    this.socket?.on("tile-claimed", callback);
  }

  public onPlayerInfected(callback: (data: { playerId: string }) => void) {
    this.socket?.on("player-infected", callback);
  }

  public onTrapTriggered(
    callback: (data: { x: number; y: number; type: string }) => void
  ) {
    this.socket?.on("trap-triggered", callback);
  }

  public onPlayerEffect(
    callback: (data: {
      playerId: string;
      type: "frozen" | "slow";
      expires: number;
    }) => void
  ) {
    this.socket?.on("player-effect", callback);
  }

  public onPlayersEliminated(
    callback: (data: { playerIds: string[] }) => void
  ) {
    this.socket?.on("players-eliminated", callback);
  }

  public onTimerUpdate(callback: (data: { time: number }) => void) {
    this.socket?.on("timer-update", callback);
  }

  public onScoresUpdate(
    callback: (data: { scores: { id: string; score: number }[] }) => void
  ) {
    this.socket?.on("scores-update", callback);
  }

  public onPhaseChanged(
    callback: (data: { phase: GameState["phase"]; timer: number }) => void
  ) {
    this.socket?.on("phase-changed", callback);
  }

  public onPlayerGuessed(
    callback: (data: { playerId: string; guess: string }) => void
  ) {
    this.socket?.on("player-guessed", callback);
  }

  public onGameOver(
    callback: (data: {
      winner: Player | { name: string } | null;
      players: Player[];
    }) => void
  ) {
    this.socket?.on("game-over", callback);
  }

  public onPlayerJoined(callback: (data: { player: Player }) => void) {
    this.socket?.on("player-joined", callback);
  }

  public onPlayerLeft(callback: (data: { playerId: string }) => void) {
    this.socket?.on("player-left", callback);
  }

  public onHostChanged(callback: (data: { newHostId: string }) => void) {
    this.socket?.on("host-changed", callback);
  }

  public onGameModeChanged(
    callback: (data: { gameMode: GameMode; gameState: GameState }) => void
  ) {
    this.socket?.on("game-mode-changed", callback);
  }

  public onAbilityActivated(
    callback: (data: {
      playerId: string;
      ability: "sprint" | "shield";
      expires: number;
    }) => void
  ) {
    this.socket?.on("ability-activated", callback);
  }

  public offAll() {
    this.socket?.off();
  }
}

export const socketService = new SocketService();
