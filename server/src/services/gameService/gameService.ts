import type {
  Room,
  Player,
  GameState,
  GameEvent,
  GameMode,
} from "@app-types/index";
import { roomManagement } from "./roomManagement";
import { playerActions } from "./playerActions";
import { gameLogic } from "./gameLogic";
import { gameTick } from "./gameTick";

class GameService {
  private rooms: Map<string, Room> = new Map();

  // Room Management
  public createRoom = (hostPlayer: Player): Room =>
    roomManagement.createRoom(this.rooms, hostPlayer);
  public joinRoom = (roomId: string, player: Player): Room | null =>
    roomManagement.joinRoom(this.rooms, roomId, player);
  public setGameMode = (roomId: string, gameMode: GameMode): GameEvent[] =>
    roomManagement.setGameMode(this.rooms, roomId, gameMode);
  public leaveRoom = (
    roomId: string,
    playerId: string
  ): { events: GameEvent[]; roomWasDeleted: boolean; updatedRoom?: Room } =>
    roomManagement.leaveRoom(this.rooms, roomId, playerId);
  public getRoom = (roomId: string): Room | undefined =>
    roomManagement.getRoom(this.rooms, roomId);
  public getAvailableRooms = (): {
    id: string;
    gameMode: GameMode;
    playerCount: number;
  }[] => roomManagement.getAvailableRooms(this.rooms);

  // Player Actions
  public updatePlayerPosition = (
    roomId: string,
    playerId: string,
    newPos: { x: number; y: number }
  ): GameEvent[] =>
    playerActions.updatePlayerPosition(this.rooms, roomId, playerId, newPos);
  public activateAbility = (roomId: string, playerId: string): GameEvent[] =>
    playerActions.activateAbility(this.rooms, roomId, playerId);
  public submitGuess = (
    roomId: string,
    playerId: string,
    guess: string
  ): GameEvent[] =>
    playerActions.submitGuess(this.rooms, roomId, playerId, guess);
  public submitHeistGuess = (
    roomId: string,
    playerId: string,
    padId: string
  ): GameEvent[] =>
    playerActions.submitHeistGuess(this.rooms, roomId, playerId, padId);

  // Game Logic
  public startGame = (
    roomId: string,
    playerId: string
  ): { room: Room | undefined; events: GameEvent[] } =>
    gameLogic.startGame(this.rooms, roomId, playerId);

  // Game Tick
  public tick = (): Map<string, GameEvent[]> => gameTick.tick(this.rooms);
}

export const gameService = new GameService();
