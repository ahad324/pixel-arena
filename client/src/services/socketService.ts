import { io, Socket } from "socket.io-client";
import { SocketEmitters } from "@services/socketEmitters";
import { SocketListeners } from "@services/socketListeners";

class SocketService {
  private socket: Socket | null = null;
  private emitters: SocketEmitters;
  private listeners: SocketListeners;

  // Emitter methods
  public createRoom: typeof SocketEmitters.prototype.createRoom;
  public joinRoom: typeof SocketEmitters.prototype.joinRoom;
  public setGameMode: typeof SocketEmitters.prototype.setGameMode;
  public leaveRoom: typeof SocketEmitters.prototype.leaveRoom;
  public getAvailableRooms: typeof SocketEmitters.prototype.getAvailableRooms;
  public sendMessage: typeof SocketEmitters.prototype.sendMessage;
  public updatePlayerPosition: typeof SocketEmitters.prototype.updatePlayerPosition;
  public activateAbility: typeof SocketEmitters.prototype.activateAbility;
  public submitHeistGuess: typeof SocketEmitters.prototype.submitHeistGuess;
  public submitGuess: typeof SocketEmitters.prototype.submitGuess;
  public startGame: typeof SocketEmitters.prototype.startGame;
  public setMazeRaceDifficulty: typeof SocketEmitters.prototype.setMazeRaceDifficulty;

  // Listener methods
  public onConnect: typeof SocketListeners.prototype.onConnect;
  public onDisconnect: typeof SocketListeners.prototype.onDisconnect;
  public onConnectError: typeof SocketListeners.prototype.onConnectError;
  public onAvailableRoomsUpdate: typeof SocketListeners.prototype.onAvailableRoomsUpdate;
  public offAvailableRoomsUpdate: typeof SocketListeners.prototype.offAvailableRoomsUpdate;
  public onNewMessage: typeof SocketListeners.prototype.onNewMessage;
  public onGameStarted: typeof SocketListeners.prototype.onGameStarted;
  public onPlayerMoved: typeof SocketListeners.prototype.onPlayerMoved;
  public onPlayerTagged: typeof SocketListeners.prototype.onPlayerTagged;
  public onTileClaimed: typeof SocketListeners.prototype.onTileClaimed;
  public onPlayerInfected: typeof SocketListeners.prototype.onPlayerInfected;
  public onTrapTriggered: typeof SocketListeners.prototype.onTrapTriggered;
  public onPlayerEffect: typeof SocketListeners.prototype.onPlayerEffect;
  public onPadGuessed: typeof SocketListeners.prototype.onPadGuessed;
  public onPlayerOnPad: typeof SocketListeners.prototype.onPlayerOnPad;
  public onPlayerOffPad: typeof SocketListeners.prototype.onPlayerOffPad;
  public onTimerUpdate: typeof SocketListeners.prototype.onTimerUpdate;
  public onScoresUpdate: typeof SocketListeners.prototype.onScoresUpdate;
  public onPhaseChanged: typeof SocketListeners.prototype.onPhaseChanged;
  public onPlayerGuessed: typeof SocketListeners.prototype.onPlayerGuessed;
  public onGameOver: typeof SocketListeners.prototype.onGameOver;
  public onPlayerJoined: typeof SocketListeners.prototype.onPlayerJoined;
  public onPlayerLeft: typeof SocketListeners.prototype.onPlayerLeft;
  public onHostChanged: typeof SocketListeners.prototype.onHostChanged;
  public onGameModeChanged: typeof SocketListeners.prototype.onGameModeChanged;
  public onAbilityActivated: typeof SocketListeners.prototype.onAbilityActivated;
  public onMazeDifficultyChanged: typeof SocketListeners.prototype.onMazeDifficultyChanged;
  public offMazeDifficultyChanged: typeof SocketListeners.prototype.offMazeDifficultyChanged;
  public onPlayerCaught: typeof SocketListeners.prototype.onPlayerCaught;
  public onPlayerConverted: typeof SocketListeners.prototype.onPlayerConverted;
  public onFootprintsUpdate: typeof SocketListeners.prototype.onFootprintsUpdate;
  public onHidersRevealed: typeof SocketListeners.prototype.onHidersRevealed;
  public offPlayerOnPad: typeof SocketListeners.prototype.offPlayerOnPad;
  public offPlayerOffPad: typeof SocketListeners.prototype.offPlayerOffPad;
  public offAll: typeof SocketListeners.prototype.offAll;

  constructor() {
    this.emitters = new SocketEmitters(this);
    this.listeners = new SocketListeners(this);

    // Bind emitter methods
    this.createRoom = this.emitters.createRoom.bind(this.emitters);
    this.joinRoom = this.emitters.joinRoom.bind(this.emitters);
    this.setGameMode = this.emitters.setGameMode.bind(this.emitters);
    this.leaveRoom = this.emitters.leaveRoom.bind(this.emitters);
    this.getAvailableRooms = this.emitters.getAvailableRooms.bind(
      this.emitters
    );
    this.sendMessage = this.emitters.sendMessage.bind(this.emitters);
    this.updatePlayerPosition = this.emitters.updatePlayerPosition.bind(
      this.emitters
    );
    this.activateAbility = this.emitters.activateAbility.bind(this.emitters);
    this.submitHeistGuess = this.emitters.submitHeistGuess.bind(this.emitters);
    this.submitGuess = this.emitters.submitGuess.bind(this.emitters);
    this.startGame = this.emitters.startGame.bind(this.emitters);
    this.setMazeRaceDifficulty = this.emitters.setMazeRaceDifficulty.bind(
      this.emitters
    );

    // Bind listener methods
    this.onConnect = this.listeners.onConnect.bind(this.listeners);
    this.onDisconnect = this.listeners.onDisconnect.bind(this.listeners);
    this.onConnectError = this.listeners.onConnectError.bind(this.listeners);
    this.onAvailableRoomsUpdate = this.listeners.onAvailableRoomsUpdate.bind(
      this.listeners
    );
    this.offAvailableRoomsUpdate = this.listeners.offAvailableRoomsUpdate.bind(
      this.listeners
    );
    this.onNewMessage = this.listeners.onNewMessage.bind(this.listeners);
    this.onGameStarted = this.listeners.onGameStarted.bind(this.listeners);
    this.onPlayerMoved = this.listeners.onPlayerMoved.bind(this.listeners);
    this.onPlayerTagged = this.listeners.onPlayerTagged.bind(this.listeners);
    this.onTileClaimed = this.listeners.onTileClaimed.bind(this.listeners);
    this.onPlayerInfected = this.listeners.onPlayerInfected.bind(
      this.listeners
    );
    this.onTrapTriggered = this.listeners.onTrapTriggered.bind(this.listeners);
    this.onPlayerEffect = this.listeners.onPlayerEffect.bind(this.listeners);
    this.onPadGuessed = this.listeners.onPadGuessed.bind(this.listeners);
    this.onPlayerOnPad = this.listeners.onPlayerOnPad.bind(this.listeners);
    this.onPlayerOffPad = this.listeners.onPlayerOffPad.bind(this.listeners);
    this.onTimerUpdate = this.listeners.onTimerUpdate.bind(this.listeners);
    this.onScoresUpdate = this.listeners.onScoresUpdate.bind(this.listeners);
    this.onPhaseChanged = this.listeners.onPhaseChanged.bind(this.listeners);
    this.onPlayerGuessed = this.listeners.onPlayerGuessed.bind(this.listeners);
    this.onGameOver = this.listeners.onGameOver.bind(this.listeners);
    this.onPlayerJoined = this.listeners.onPlayerJoined.bind(this.listeners);
    this.onPlayerLeft = this.listeners.onPlayerLeft.bind(this.listeners);
    this.onHostChanged = this.listeners.onHostChanged.bind(this.listeners);
    this.onGameModeChanged = this.listeners.onGameModeChanged.bind(
      this.listeners
    );
    this.onAbilityActivated = this.listeners.onAbilityActivated.bind(
      this.listeners
    );
    this.onMazeDifficultyChanged = this.listeners.onMazeDifficultyChanged.bind(
      this.listeners
    );
    this.offMazeDifficultyChanged =
      this.listeners.offMazeDifficultyChanged.bind(this.listeners);
    this.onPlayerCaught = this.listeners.onPlayerCaught.bind(this.listeners);
    this.onPlayerConverted = this.listeners.onPlayerConverted.bind(
      this.listeners
    );
    this.onFootprintsUpdate = this.listeners.onFootprintsUpdate.bind(
      this.listeners
    );
    this.onHidersRevealed = this.listeners.onHidersRevealed.bind(
      this.listeners
    );
    this.offPlayerOnPad = this.listeners.offPlayerOnPad.bind(this.listeners);
    this.offPlayerOffPad = this.listeners.offPlayerOffPad.bind(this.listeners);
    this.offAll = this.listeners.offAll.bind(this.listeners);
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public connect() {
    if (!this.socket?.connected) {
      const backendUrl =
        (import.meta as any).env.VITE_BACKEND_URL || "http://localhost:3000";
      this.socket = io(backendUrl, {
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
