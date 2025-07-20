import type { Room, Player, GameEvent } from "@app-types/index";
import { GameMode } from "@app-types/index";
import { GAME_SETTINGS, GRID_SIZE } from "@config/constants";
import {
  createInitialGameState,
  calculateDistances,
} from "../../common/helpers";
import { gameService } from "@services/gameService/gameService";
import { getMaze } from "@utils/mazePool";

export const hideAndSeekLogic = {
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
    room.gameState.timer = GAME_SETTINGS[GameMode.HIDE_AND_SEEK].TIME_LIMIT;
    room.gameState.seekerFreezeUntil =
      Date.now() + GAME_SETTINGS[GameMode.HIDE_AND_SEEK].SEEKER_START_DELAY;
    room.gameState.maze!.grid = await getMaze();

    // Assign roles
    room.players.forEach((p) => {
      p.score = 0;
      p.isEliminated = false;
      p.isSeeker = false;
      p.isCaught = false;
    });
    const seeker =
      room.players[Math.floor(Math.random() * room.players.length)];
    seeker.isSeeker = true;

    // Position players far apart
    const emptyCells: { x: number; y: number }[] = [];
    room.gameState.maze!.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 0) emptyCells.push({ x, y });
      });
    });

    const seekerStartPos =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    seeker.x = seekerStartPos.x;
    seeker.y = seekerStartPos.y;

    const distances = calculateDistances(
      room.gameState.maze!.grid,
      seeker.x,
      seeker.y
    );
    const hiders = room.players.filter((p) => !p.isSeeker);

    // Sort empty cells by distance from seeker
    emptyCells.sort(
      (a, b) => (distances[b.y]?.[b.x] ?? 0) - (distances[a.y]?.[a.x] ?? 0)
    );

    hiders.forEach((hider, index) => {
      const pos =
        emptyCells[index * 5] ?? emptyCells[emptyCells.length - 1 - index]; // Spread them out
      if (pos) {
        hider.x = pos.x;
        hider.y = pos.y;
      }
    });

    return { room, events: [{ name: "game-started", data: { room } }] };
  },

  handleMove: (
    room: Room,
    player: Player,
    newPos: { x: number; y: number }
  ): GameEvent[] => {
    const events: GameEvent[] = [];
    if (
      room.gameState.maze?.grid[newPos.y]?.[newPos.x] === 1 ||
      player.isCaught
    )
      return events;

    const now = Date.now();
    if (
      player.isSeeker &&
      room.gameState.seekerFreezeUntil &&
      now < room.gameState.seekerFreezeUntil
    ) {
      return events;
    }

    player.x = newPos.x;
    player.y = newPos.y;
    events.push({
      name: "player-moved",
      data: { playerId: player.id, x: player.x, y: player.y },
    });

    if (player.isSeeker) {
      const taggedPlayer = room.players.find(
        (p) =>
          !p.isSeeker && !p.isCaught && p.x === player.x && p.y === player.y
      );
      if (taggedPlayer) {
        events.push(...hideAndSeekLogic.handleTag(room, taggedPlayer));
      }
    } else {
      // Hider moved, create a footprint
      room.gameState.footprints!.push({
        x: player.x,
        y: player.y,
        timestamp: Date.now(),
        playerId: player.id,
      });
      events.push({
        name: "footprints-update",
        data: { footprints: room.gameState.footprints },
      });
    }
    return events;
  },

  handleTag: (room: Room, taggedPlayer: Player): GameEvent[] => {
    taggedPlayer.isCaught = true;
    taggedPlayer.conversionTime =
      Date.now() + GAME_SETTINGS[GameMode.HIDE_AND_SEEK].CONVERSION_DELAY;
    return [{ name: "player-caught", data: { playerId: taggedPlayer.id } }];
  },

  handleAbility: (room: Room, player: Player): GameEvent[] => {
    if (!player.isSeeker) return [];
    const now = Date.now();
    const settings = GAME_SETTINGS[GameMode.HIDE_AND_SEEK];
    if (
      !player.lastRevealTime ||
      now - player.lastRevealTime > settings.REVEAL_COOLDOWN
    ) {
      player.lastRevealTime = now;
      return [
        {
          name: "hiders-revealed",
          data: { duration: settings.REVEAL_DURATION },
        },
        {
          name: "ability-activated",
          data: {
            playerId: player.id,
            ability: "reveal",
            expires: now + settings.REVEAL_COOLDOWN,
          },
        },
      ];
    }
    return [];
  },

  endGame: (room: Room): GameEvent[] => {
    gameService.deactivateRoom(room.id);
    room.gameState.status = "finished";

    const remainingHiders = room.players.filter(
      (p) => !p.isSeeker && !p.isCaught
    );
    if (remainingHiders.length > 0) {
      room.gameState.winner = { name: "Hider Team" };
    } else {
      room.gameState.winner = { name: "Seeker Team" };
    }

    return [
      {
        name: "game-over",
        data: { winner: room.gameState.winner, players: room.players },
      },
    ];
  },
};
