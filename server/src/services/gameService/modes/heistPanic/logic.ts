import type { Room, Player, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GRID_SIZE } from "@config/constants";
import { GAME_SETTINGS } from "@config/constants";
import { createInitialGameState } from "../../common/helpers";

export const heistPanicLogic = {
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
    room.gameState.timer = GAME_SETTINGS[GameMode.HEIST_PANIC].TIME_LIMIT;
    room.players.forEach((p) => {
      p.score = 0;
      p.isEliminated = false;
      p.isIt = false;
      p.x = Math.floor(Math.random() * GRID_SIZE);
      p.y = Math.floor(Math.random() * GRID_SIZE);
    });

    return { room, events: [{ name: "game-started", data: { room } }] };
  },

  handleMove: (room: Room, player: Player, newPos: { x: number; y: number }): GameEvent[] => {
    const events: GameEvent[] = [];
    player.x = newPos.x;
    player.y = newPos.y;
    events.push({
      name: "player-moved",
      data: { playerId: player.id, x: player.x, y: player.y },
    });
    return events;
  },

  handleGuess: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string,
    padId: string
  ): GameEvent[] => {
    const room = rooms.get(roomId);
    if (
      !room ||
      room.gameState.status !== "playing" ||
      room.gameMode !== GameMode.HEIST_PANIC
    )
      return [];

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return [];

    const pad = room.gameState.codePads?.find((p) => p.id === padId);
    if (!pad || player.x !== pad.x || player.y !== pad.y) return [];

    const now = Date.now();
    if (player.effects?.some((e) => e.type === "frozen" && e.expires > now)) return [];

    if (pad.id === room.gameState.correctPadId) {
      return heistPanicLogic.endGame(room, player);
    } else {
      const settings = GAME_SETTINGS[GameMode.HEIST_PANIC];
      if (!player.effects) player.effects = [];

      const expires = now + settings.STUN_DURATION;
      player.effects.push({ type: "frozen", expires });
      
      const events: GameEvent[] = [
        { name: "player-effect", data: { playerId, type: 'frozen', expires }},
        { name: "pad-guessed", data: { padId, correct: false }}
      ];
      return events;
    }
  },

  endGame: (room: Room, winner: Player | null = null): GameEvent[] => {
    room.gameState.status = "finished";
    if (winner) {
      room.gameState.winner = winner;
    } else {
      room.gameState.winner = { name: "The Vault" };
    }
    const events: GameEvent[] = [
      {
        name: "game-over",
        data: { winner: room.gameState.winner, players: room.players },
      },
    ];
    if (winner && room.gameState.correctPadId) {
      events.unshift({
        name: "pad-guessed",
        data: { padId: room.gameState.correctPadId, correct: true },
      });
    }
    return events;
  },
};