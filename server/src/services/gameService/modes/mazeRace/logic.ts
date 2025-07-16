import type { Room, Player, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { createInitialGameState, calculateDistances } from "../../common/helpers";
import { mazeRaceHelpers } from "./helpers";

export const mazeRaceLogic = {
  startGame: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string
  ): { room: Room | undefined; events: GameEvent[] } => {
    const room = rooms.get(roomId);
    if (
      !room ||
      room.hostId !== playerId ||
      room.gameState.status !== "waiting"
    )
      return { room: undefined, events: [] };

    room.gameState = createInitialGameState(room.gameMode, room.players.length);
    room.gameState.status = "playing";
    mazeRaceHelpers.setupMazeRace(room);

    return { room, events: [{ name: "game-started", data: { room } }] };
  },

  handleMove: (room: Room, player: Player, newPos: { x: number; y: number }): GameEvent[] => {
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
      events.push(...mazeRaceLogic.endGame(room, player));
    }
    return events;
  },

  endGame: (room: Room, winner: Player | null = null): GameEvent[] => {
    room.gameState.status = "finished";
    if (winner) {
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