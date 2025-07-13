import { Server, Socket } from "socket.io";
import { gameService } from "@services/gameService";
import type { Player, Room, GameMode, GameEvent } from "@app-types/index";

const TICK_RATE = 20; // Ticks per second
const TICK_INTERVAL = 1000 / TICK_RATE;

export const initializeSockets = (io: Server) => {
  const socketPlayerMap = new Map<
    string,
    { playerId: string; roomId: string }
  >();

  const dispatchEvents = (roomId: string, events: GameEvent[]) => {
    events.forEach((event) => {
      io.to(roomId).emit(event.name, event.data);
    });
  };

  const gameLoop = () => {
    const eventsByRoom = gameService.tick();
    eventsByRoom.forEach((events, roomId) => {
      if (events.length > 0) {
        dispatchEvents(roomId, events);
      }
    });
  };

  setInterval(gameLoop, TICK_INTERVAL);

  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    const notifyAvailableRoomsUpdate = () => {
      io.emit("available-rooms-update", gameService.getAvailableRooms());
    };

    socket.on("get-available-rooms", () => {
      socket.emit("available-rooms-update", gameService.getAvailableRooms());
    });

    socket.on(
      "create-room",
      (
        {
          user,
          gameMode,
        }: { user: Omit<Player, "socketId">; gameMode: GameMode },
        callback: (room: Room) => void
      ) => {
        const player: Player = { ...user, socketId: socket.id };
        const room = gameService.createRoom(player);
        gameService.setGameMode(room.id, gameMode);
        socket.join(room.id);
        socketPlayerMap.set(socket.id, {
          playerId: player.id,
          roomId: room.id,
        });
        callback(room);
        notifyAvailableRoomsUpdate();
        console.log(`Player ${player.name} created and joined room ${room.id}`);
      }
    );

    socket.on(
      "join-room",
      (
        { roomId, user }: { roomId: string; user: Omit<Player, "socketId"> },
        callback: (res: { room: Room | null; error?: string }) => void
      ) => {
        const player: Player = { ...user, socketId: socket.id };
        const room = gameService.joinRoom(roomId, player);
        if (room) {
          socket.join(roomId);
          socketPlayerMap.set(socket.id, {
            playerId: player.id,
            roomId: roomId,
          });
          callback({ room });
          socket
            .to(roomId)
            .emit("player-joined", {
              player: room.players.find((p) => p.id === player.id),
            });
          notifyAvailableRoomsUpdate();
          console.log(`Player ${player.name} joined room ${roomId}`);
        } else {
          callback({ room: null, error: "Room not found or is full." });
        }
      }
    );

    socket.on(
      "set-game-mode",
      ({ roomId, gameMode }: { roomId: string; gameMode: GameMode }) => {
        const events = gameService.setGameMode(roomId, gameMode);
        dispatchEvents(roomId, events);
      }
    );

    socket.on(
      "start-game",
      ({ roomId, playerId }: { roomId: string; playerId: string }) => {
        const { room, events } = gameService.startGame(roomId, playerId);
        if (room) {
          dispatchEvents(roomId, events);
          notifyAvailableRoomsUpdate();
        }
      }
    );

    socket.on(
      "player-move",
      ({
        roomId,
        playerId,
        newPos,
      }: {
        roomId: string;
        playerId: string;
        newPos: { x: number; y: number };
      }) => {
        const events = gameService.updatePlayerPosition(
          roomId,
          playerId,
          newPos
        );
        if (events.length > 0) dispatchEvents(roomId, events);
      }
    );

    socket.on(
      "player-ability",
      ({ roomId, playerId }: { roomId: string; playerId: string }) => {
        const events = gameService.activateAbility(roomId, playerId);
        if (events.length > 0) dispatchEvents(roomId, events);
      }
    );

    socket.on(
      "player-guess",
      ({
        roomId,
        playerId,
        guess,
      }: {
        roomId: string;
        playerId: string;
        guess: string;
      }) => {
        const events = gameService.submitGuess(roomId, playerId, guess);
        if (events.length > 0) dispatchEvents(roomId, events);
      }
    );

    const handleLeave = (socketId: string) => {
      const playerInfo = socketPlayerMap.get(socketId);
      if (playerInfo) {
        const { playerId, roomId } = playerInfo;
        const { events, roomWasDeleted, updatedRoom } = gameService.leaveRoom(
          roomId,
          playerId
        );

        socketPlayerMap.delete(socketId);

        if (roomWasDeleted) {
          console.log(`Room ${roomId} was deleted.`);
        } else {
          dispatchEvents(roomId, events);
          console.log(`Player ${playerId} left room ${roomId}`);
        }
        notifyAvailableRoomsUpdate();
      }
    };

    socket.on("leave-room", () => {
      handleLeave(socket.id);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      handleLeave(socket.id);
    });
  });
};
