import type { Room, Player, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GAME_SETTINGS, GRID_SIZE } from "@config/constants";
import { createInitialGameState } from "../../common/helpers";

export const tagLogic = {
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
    room.gameState.timer = GAME_SETTINGS[GameMode.TAG].TIME_LIMIT;
    room.players.forEach((p) => {
      p.score = 0;
      p.isEliminated = false;
      p.isIt = false;
      p.x = Math.floor(Math.random() * GRID_SIZE);
      p.y = Math.floor(Math.random() * GRID_SIZE);
    });
    room.players[Math.floor(Math.random() * room.players.length)].isIt = true;

    return { room, events: [{ name: "game-started", data: { room } }] };
  },

  handleMove: (
    room: Room,
    player: Player,
    newPos: { x: number; y: number }
  ): GameEvent[] => {
    const events: GameEvent[] = [];
    player.x = newPos.x;
    player.y = newPos.y;
    events.push({
      name: "player-moved",
      data: { playerId: player.id, x: player.x, y: player.y },
    });

    if (player.isIt) {
      const taggedPlayer = room.players.find(
        (p) => !p.isIt && p.x === player.x && p.y === player.y
      );
      if (taggedPlayer) {
        player.isIt = false;
        taggedPlayer.isIt = true;
        events.push({
          name: "player-tagged",
          data: { oldIt: player.id, newIt: taggedPlayer.id },
        });
      }
    }
    return events;
  },

  endGame: (room: Room, winner: Player | null = null): GameEvent[] => {
    room.gameState.status = "finished";
    room.gameState.winner = winner ?? evaluateResult(room);

    return [
      {
        name: "game-over",
        data: { winner: room.gameState.winner, players: room.players },
      },
    ];
  },
};

export const evaluateResult = (room: Room): Player | null => {
  if (!room.players.length) return null;
  return room.players.reduce((prev, curr) =>
    prev.score > curr.score ? prev : curr
  );
};
