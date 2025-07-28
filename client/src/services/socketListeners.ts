import type {
  Room,
  Player,
  GameMode,
  GameState,
  MazeRaceDifficulty,
  Footprint,
  ChatMessage,
} from "../types/index";

// Forward declaration to avoid circular imports
interface SocketService {
  getSocket(): any;
}

export class SocketListeners {
  private socketService: SocketService;

  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  // --- Connection Status Listeners ---
  public onConnect(callback: () => void) {
    this.socketService.getSocket()?.on("connect", callback);
  }

  public onDisconnect(callback: () => void) {
    this.socketService.getSocket()?.on("disconnect", callback);
  }

  public onConnectError(callback: (err: Error) => void) {
    this.socketService.getSocket()?.on("connect_error", callback);
  }

  public onAvailableRoomsUpdate(
    callback: (
      rooms: { id: string; gameMode: GameMode; playerCount: number }[]
    ) => void
  ) {
    this.socketService.getSocket()?.on("available-rooms-update", callback);
  }

  public offAvailableRoomsUpdate() {
    this.socketService.getSocket()?.off("available-rooms-update");
  }

  public onNewMessage(callback: (message: ChatMessage) => void) {
    this.socketService.getSocket()?.on("new-message", callback);
  }

  public onGameStarted(callback: (data: { room: Room }) => void) {
    this.socketService.getSocket()?.on("game-started", callback);
  }

  public onPlayerMoved(
    callback: (data: { playerId: string; x: number; y: number }) => void
  ) {
    this.socketService.getSocket()?.on("player-moved", callback);
  }

  public onPlayerTagged(
    callback: (data: { oldIt: string; newIt: string }) => void
  ) {
    this.socketService.getSocket()?.on("player-tagged", callback);
  }

  public onTileClaimed(
    callback: (data: {
      x: number;
      y: number;
      playerId: string;
      color: string;
    }) => void
  ) {
    this.socketService.getSocket()?.on("tile-claimed", callback);
  }

  public onPlayerInfected(callback: (data: { playerId: string }) => void) {
    this.socketService.getSocket()?.on("player-infected", callback);
  }

  public onTrapTriggered(
    callback: (data: { x: number; y: number; type: string }) => void
  ) {
    this.socketService.getSocket()?.on("trap-triggered", callback);
  }

  public onPlayerEffect(
    callback: (data: {
      playerId: string;
      type: "frozen" | "slow";
      expires: number;
    }) => void
  ) {
    this.socketService.getSocket()?.on("player-effect", callback);
  }

  public onPadGuessed(
    callback: (data: { padId: string; correct: boolean }) => void
  ) {
    this.socketService.getSocket()?.on("pad-guessed", callback);
  }

  public onPlayerOnPad(
    callback: (data: { playerId: string; padId: string }) => void
  ) {
    this.socketService.getSocket()?.on("player-on-pad", callback);
  }

  public offPlayerOnPad() {
    this.socketService.getSocket()?.off("player-on-pad");
  }

  public onPlayerOffPad(callback: (data: { playerId: string }) => void) {
    this.socketService.getSocket()?.on("player-off-pad", callback);
  }

  public offPlayerOffPad() {
    this.socketService.getSocket()?.off("player-off-pad");
  }

  public onTimerUpdate(callback: (data: { time: number }) => void) {
    this.socketService.getSocket()?.on("timer-update", callback);
  }

  public onScoresUpdate(
    callback: (data: { scores: { id: string; score: number }[] }) => void
  ) {
    this.socketService.getSocket()?.on("scores-update", callback);
  }

  public onPhaseChanged(
    callback: (data: { phase: GameState["phase"]; timer: number }) => void
  ) {
    this.socketService.getSocket()?.on("phase-changed", callback);
  }

  public onPlayerGuessed(
    callback: (data: { playerId: string; guess: string }) => void
  ) {
    this.socketService.getSocket()?.on("player-guessed", callback);
  }

  public onGameOver(
    callback: (data: {
      winner: Player | { name: string } | null;
      players: Player[];
    }) => void
  ) {
    this.socketService.getSocket()?.on("game-over", callback);
  }

  public onPlayerJoined(callback: (data: { player: Player }) => void) {
    this.socketService.getSocket()?.on("player-joined", callback);
  }

  public onPlayerLeft(callback: (data: { playerId: string }) => void) {
    this.socketService.getSocket()?.on("player-left", callback);
  }

  public onHostChanged(callback: (data: { newHostId: string }) => void) {
    this.socketService.getSocket()?.on("host-changed", callback);
  }

  public onGameModeChanged(
    callback: (data: { gameMode: GameMode; gameState: GameState }) => void
  ) {
    this.socketService.getSocket()?.on("game-mode-changed", callback);
  }

  public onAbilityActivated(
    callback: (data: {
      playerId: string;
      ability: "sprint" | "shield" | "reveal";
      expires: number;
    }) => void
  ) {
    this.socketService.getSocket()?.on("ability-activated", callback);
  }

  public onMazeDifficultyChanged(
    callback: (data: { difficulty: MazeRaceDifficulty; room: Room }) => void
  ) {
    this.socketService.getSocket()?.on("maze-difficulty-changed", callback);
  }

  public offMazeDifficultyChanged() {
    this.socketService.getSocket()?.off("maze-difficulty-changed");
  }

  // Hide and Seek Listeners
  public onPlayerCaught(callback: (data: { playerId: string }) => void) {
    this.socketService.getSocket()?.on("player-caught", callback);
  }
  public onPlayerConverted(callback: (data: { playerId: string }) => void) {
    this.socketService.getSocket()?.on("player-converted", callback);
  }
  public onFootprintsUpdate(
    callback: (data: { footprints: Footprint[] }) => void
  ) {
    this.socketService.getSocket()?.on("footprints-update", callback);
  }
  public onHidersRevealed(callback: (data: { duration: number }) => void) {
    this.socketService.getSocket()?.on("hiders-revealed", callback);
  }

  public offAll() {
    this.socketService.getSocket()?.off();
  }
}
