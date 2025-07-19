import type {
  Room,
  Player,
  GameMode,
  MazeRaceDifficulty,
} from "../types/index";

// Forward declaration to avoid circular imports
interface SocketService {
  getSocket(): any;
}

export class SocketEmitters {
  private socketService: SocketService;

  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  public createRoom(
    user: Omit<Player, "socketId">,
    gameMode: GameMode,
    callback: (room: Room) => void
  ) {
    this.socketService
      .getSocket()
      ?.emit("create-room", { user, gameMode }, callback);
  }

  public joinRoom(
    roomId: string,
    user: Omit<Player, "socketId">,
    callback: (res: { room: Room | null; error?: string }) => void
  ) {
    this.socketService
      .getSocket()
      ?.emit("join-room", { roomId, user }, callback);
  }

  public setGameMode(roomId: string, gameMode: GameMode) {
    this.socketService.getSocket()?.emit("set-game-mode", { roomId, gameMode });
  }

  public leaveRoom() {
    this.socketService.getSocket()?.emit("leave-room");
  }

  public getAvailableRooms() {
    this.socketService.getSocket()?.emit("get-available-rooms");
  }

  public updatePlayerPosition(
    roomId: string,
    playerId: string,
    newPos: { x: number; y: number }
  ) {
    this.socketService
      .getSocket()
      ?.emit("player-move", { roomId, playerId, newPos });
  }

  public activateAbility(roomId: string, playerId: string) {
    this.socketService
      .getSocket()
      ?.emit("player-ability", { roomId, playerId });
  }

  public submitHeistGuess(roomId: string, playerId: string, padId: string) {
    this.socketService
      .getSocket()
      ?.emit("player-heist-guess", { roomId, playerId, padId });
  }

  public submitGuess(roomId: string, playerId: string, guess: string) {
    this.socketService
      .getSocket()
      ?.emit("player-guess", { roomId, playerId, guess });
  }

  public startGame(roomId: string, playerId: string) {
    this.socketService.getSocket()?.emit("start-game", { roomId, playerId });
  }

  public setMazeRaceDifficulty(
    roomId: string,
    playerId: string,
    difficulty: MazeRaceDifficulty
  ) {
    this.socketService
      .getSocket()
      ?.emit("set-maze-difficulty", { roomId, playerId, difficulty });
  }
}
