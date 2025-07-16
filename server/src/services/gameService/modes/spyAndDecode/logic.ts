import type { Room, Player, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GRID_SIZE } from "@config/constants";
import { GAME_SETTINGS } from "@config/constants";
import { createInitialGameState } from "../../common/helpers";

export const spyAndDecodeLogic = {
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
    room.gameState.phase = "signaling";
    room.gameState.timer = GAME_SETTINGS[GameMode.SPY_AND_DECODE].SIGNAL_TIME;
    room.players.forEach((p) => {
      p.score = 0;
      p.isEliminated = false;
      p.isIt = false;
      p.isSpy = false;
      p.guess = null;
      p.x = Math.floor(Math.random() * GRID_SIZE);
      p.y = Math.floor(Math.random() * GRID_SIZE);
    });
    if (room.players.length > 1) {
      room.players[Math.floor(Math.random() * room.players.length)].isSpy =
        true;
    } else {
      room.players[0].isSpy = true;
    }

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
    return events;
  },

  handleGuess: (
    rooms: Map<string, Room>,
    roomId: string,
    playerId: string,
    guess: string
  ): GameEvent[] => {
    const room = rooms.get(roomId);
    if (
      !room ||
      room.gameState.status !== "playing" ||
      room.gameMode !== GameMode.SPY_AND_DECODE ||
      room.gameState.phase !== "guessing"
    )
      return [];
    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.guess) return [];

    if (!room.gameState.playerGuesses) room.gameState.playerGuesses = {};
    room.gameState.playerGuesses[playerId] = guess;
    player.guess = guess;
    return [{ name: "player-guessed", data: { playerId, guess } }];
  },

  endGame: (room: Room, winner: Player | null = null): GameEvent[] => {
    room.gameState.status = "finished";
    room.gameState.phase = "reveal";
    if (winner) {
      room.gameState.winner = winner;
    } else {
      const spy = room.players.find((p) => p.isSpy);
      const correctGuessers = room.players.filter(
        (p) => p.guess === room.gameState.correctCodeId
      );
      correctGuessers.forEach((p) => (p.score += 1));
      if (
        spy &&
        correctGuessers.some((p) => !p.isSpy) &&
        correctGuessers.length < room.players.length / 2
      ) {
        spy.score += 2;
        room.gameState.winner = spy;
      } else if (correctGuessers.length > 0) {
        room.gameState.winner = { name: "The Agents" };
      } else {
        room.gameState.winner = spy || { name: "No one found the code!" };
      }
    }
    return [
      {
        name: "game-over",
        data: { winner: room.gameState.winner, players: room.players },
      },
    ];
  },
};
