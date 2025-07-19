import type {
  Room,
  Player,
  GameEvent,
  MazeRaceDifficulty,
} from "@app-types/index";
import { GameMode } from "@app-types/index";
import { roomManagement } from "./helpers";
import { playerActions } from "./helpers";
import { tagLogic, tagTick } from "./modes/tag";
import {
  territoryControlLogic,
  territoryControlTick,
} from "./modes/teritorryControl";
import { mazeRaceLogic } from "./modes/mazeRace";
import {
  infectionArenaLogic,
  infectionArenaTick,
} from "./modes/infectionArena";
import { trapRushLogic, trapRushTick } from "./modes/trapRush";
import { spyAndDecodeLogic, spyAndDecodeTick } from "./modes/spyAndDecode";
import { heistPanicLogic, heistPanicTick } from "./modes/heistPanic";

class GameService {
  private rooms: Map<string, Room> = new Map();
  private active = new Set<string>();

  // Room Management
  private registerRoomAndReturn = (
    result: { room: Room | undefined; events: GameEvent[] },
    roomId: string
  ) => {
    if (result.room) this.active.add(roomId);
    return result;
  };
  public deactivateRoom(roomId: string) {
  this.active.delete(roomId);
}


  public createRoom = (hostPlayer: Player): Room =>
    roomManagement.createRoom(this.rooms, hostPlayer);
  public joinRoom = (roomId: string, player: Player): Room | null =>
    roomManagement.joinRoom(this.rooms, roomId, player);
  public setGameMode = (roomId: string, gameMode: GameMode): GameEvent[] =>
    roomManagement.setGameMode(this.rooms, roomId, gameMode);
  public setMazeRaceDifficulty = (
    roomId: string,
    playerId: string,
    difficulty: MazeRaceDifficulty
  ): GameEvent[] =>
    mazeRaceLogic.setDifficulty(this.rooms, roomId, playerId, difficulty)
      .events;
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
  public startGame = async (
    roomId: string,
    playerId: string
  ): Promise<{ room: Room | undefined; events: GameEvent[] }> => {
    const room = this.rooms.get(roomId);
    if (
      !room ||
      room.hostId !== playerId ||
      room.gameState.status !== "waiting"
    )
      return { room: undefined, events: [] };

    switch (room.gameMode) {
      case GameMode.TAG:
        return this.registerRoomAndReturn(
          tagLogic.startGame(this.rooms, roomId, playerId),
          roomId
        );
      case GameMode.TERRITORY_CONTROL:
        return this.registerRoomAndReturn(
          territoryControlLogic.startGame(this.rooms, roomId, playerId),
          roomId
        );

      case GameMode.MAZE_RACE:
        return this.registerRoomAndReturn(
          await mazeRaceLogic.startGame(this.rooms, roomId, playerId),
          roomId
        );

      case GameMode.INFECTION_ARENA:
        return this.registerRoomAndReturn(
          infectionArenaLogic.startGame(this.rooms, roomId, playerId),
          roomId
        );

      case GameMode.TRAP_RUSH:
        return this.registerRoomAndReturn(
          trapRushLogic.startGame(this.rooms, roomId, playerId),
          roomId
        );

      case GameMode.SPY_AND_DECODE:
        return this.registerRoomAndReturn(
          spyAndDecodeLogic.startGame(this.rooms, roomId, playerId),
          roomId
        );

      case GameMode.HEIST_PANIC:
        return this.registerRoomAndReturn(
          heistPanicLogic.startGame(this.rooms, roomId, playerId),
          roomId
        );

      default:
        return { room: undefined, events: [] };
    }
  };

  // Game Tick
  public tick = (): Map<string, GameEvent[]> => {
    const allEvents = new Map<string, GameEvent[]>();
    this.rooms.forEach((room, roomId) => {
      if (room.gameState.status !== "playing") return;
      let events: GameEvent[] = [];
      switch (room.gameMode) {
        case GameMode.TAG:
          events = tagTick.tick(room);
          break;
        case GameMode.TERRITORY_CONTROL:
          events = territoryControlTick.tick(room);
          break;
        case GameMode.MAZE_RACE:
          events = []; // Maze Race has no tick logic
          break;
        case GameMode.INFECTION_ARENA:
          events = infectionArenaTick.tick(room);
          break;
        case GameMode.TRAP_RUSH:
          events = trapRushTick.tick(room);
          break;
        case GameMode.SPY_AND_DECODE:
          events = spyAndDecodeTick.tick(room);
          break;
        case GameMode.HEIST_PANIC:
          events = heistPanicTick.tick(room);
          break;
      }
      if (events.length > 0) {
        allEvents.set(roomId, events);
      }
    });
    return allEvents;
  };

  public tickActive(): Map<string, GameEvent[]> {
    const all = new Map<string, GameEvent[]>();
    for (const roomId of this.active) {
      const room = this.rooms.get(roomId)!;
      let events: GameEvent[] = [];
      switch (room.gameMode) {
        case GameMode.TAG:
          events = tagTick.tick(room);
          break;
        case GameMode.TERRITORY_CONTROL:
          events = territoryControlTick.tick(room);
          break;
        case GameMode.INFECTION_ARENA:
          events = infectionArenaTick.tick(room);
          break;
        case GameMode.TRAP_RUSH:
          events = trapRushTick.tick(room);
          break;
        case GameMode.SPY_AND_DECODE:
          events = spyAndDecodeTick.tick(room);
          break;
        case GameMode.HEIST_PANIC:
          events = heistPanicTick.tick(room);
          break;
        // Maze‑Race has no per‑tick logic
      }
      if (events.length) all.set(roomId, events);
    }
    return all;
  }
}

export const gameService = new GameService();
