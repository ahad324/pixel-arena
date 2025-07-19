import type { Room, Player, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GAME_SETTINGS, GRID_SIZE } from "@config/constants";
import { createInitialGameState } from "../../common/helpers";

export const territoryControlLogic = {
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
    room.gameState.timer = GAME_SETTINGS[GameMode.TERRITORY_CONTROL].TIME_LIMIT;
    room.players.forEach((p) => {
      p.score = 0;
      p.isEliminated = false;
      p.isIt = false;
      p.x = Math.floor(Math.random() * GRID_SIZE);
      p.y = Math.floor(Math.random() * GRID_SIZE);
    });

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

    if (
      room.gameState.tiles &&
      room.gameState.tiles[player.y][player.x].claimedBy !== player.id
    ) {
      room.gameState.tiles[player.y][player.x] = {
        claimedBy: player.id,
        color: player.color,
      };
      events.push({
        name: "tile-claimed",
        data: {
          x: player.x,
          y: player.y,
          playerId: player.id,
          color: player.color,
        },
      });

      const scores = calculateTerritoryScores(room);
      room.players.forEach((p) => (p.score = scores[p.id] || 0));
      events.push({
        name: "scores-update",
        data: {
          scores: room.players.map((p) => ({ id: p.id, score: p.score })),
        },
      });
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

function calculateTerritoryScores(room: Room): { [id: string]: number } {
  const scores: { [id: string]: number } = {};
  room.gameState.tiles?.flat().forEach((t) => {
    if (t.claimedBy) scores[t.claimedBy] = (scores[t.claimedBy] || 0) + 1;
  });
  return scores;
}

export const evaluateResult = (room: Room): Player | null => {
  const scores = calculateTerritoryScores(room);
  room.players.forEach((p) => (p.score = scores[p.id] || 0));

  const winnerId = Object.keys(scores).reduce(
    (a, b) => (scores[a] > scores[b] ? a : b),
    ""
  );

  return room.players.find((p) => p.id === winnerId) || null;
};
