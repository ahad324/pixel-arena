import { Room, Player, GameEvent, MazeRaceDifficulty } from "@app-types/index";
import { GameMode } from "@app-types/index";
import {
  createInitialGameState,
  calculateDistances,
} from "../../common/helpers";
import { mazeRaceHelpers } from "./helpers";
import { gameService } from "@services/gameService/gameService";
import { getMaze } from "@utils/mazePool";

export const mazeRaceLogic = {
  startGame: async (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string
  ): Promise<{ room: Room | undefined; events: GameEvent[] }> => {
    const room = rooms.get(roomId);
    if (
      !room ||
      room.hostId !== playerId ||
      room.gameState.status !== "waiting"
    )
      return { room: undefined, events: [] };

    room.gameState = createInitialGameState(room.gameMode, room.players.length);
    room.gameState.status = "playing";
    // grab a full grid (sync in dev, worker in prod)
    room.gameState.maze!.grid = await getMaze();
    // now carve start/end, place players
    mazeRaceHelpers.setupMazeRace(room);

    return { room, events: [{ name: "game-started", data: { room } }] };
  },

  setDifficulty: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string,
    difficulty: MazeRaceDifficulty
  ): { room: Room | undefined; events: GameEvent[] } => {
    const room = rooms.get(roomId);
    if (
      !room ||
      room.hostId !== playerId ||
      room.gameState.status !== "waiting" ||
      room.gameMode !== GameMode.MAZE_RACE
    )
      return { room: undefined, events: [] };

    mazeRaceHelpers.setMazeRaceDifficulty(room, difficulty);

    return {
      room,
      events: [
        {
          name: "maze-difficulty-changed",
          data: { difficulty, room },
        },
      ],
    };
  },

  handleMove: (
    room: Room,
    player: Player,
    newPos: { x: number; y: number }
  ): GameEvent[] => {
    const events: GameEvent[] = [];
    if (room.gameState.maze?.grid[newPos.y]?.[newPos.x] === 1) return events;

    player.x = newPos.x;
    player.y = newPos.y;
    events.push({
      name: "player-moved",
      data: { playerId: player.id, x: player.x, y: player.y },
    });

    if (
      player.x === room.gameState.maze?.end.x &&
      player.y === room.gameState.maze?.end.y
    ) {
      room.gameState.status = "finished";
      events.push(...mazeRaceLogic.endGame(room, player));
    }

    return events;
  },

  endGame: (room: Room, winner: Player | null = null): GameEvent[] => {
    gameService.deactivateRoom(room.id);

    room.gameState.status = "finished";

    if (winner) {
      winner.score = 1;
      room.gameState.winner = winner;
    }

    return [
      {
        name: "game-over",
        data: { winner: room.gameState.winner, players: room.players },
      },
    ];
  },
};
