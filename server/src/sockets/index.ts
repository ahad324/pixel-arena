import { Server, Socket } from "socket.io";
import { gameService } from "@services/gameService";
import type { Player, Room, GameMode } from "@app-types/index";

export const initializeSockets = (io: Server) => {
  const socketPlayerMap = new Map<string, { playerId: string; roomId: string }>();

  const notifyRoomUpdate = (roomId: string, room: Room | undefined | null) => {
    if (room) io.to(roomId).emit("room-update", room);
  };

  const notifyAvailableRoomsUpdate = () => {
    io.emit("available-rooms-update", gameService.getAvailableRooms());
  };

  const notifyCallback = (roomId: string, room: Room) => {
    io.to(roomId).emit("room-update", room);
  };

  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    socket.on("get-available-rooms", () => {
      socket.emit("available-rooms-update", gameService.getAvailableRooms());
    });

    socket.on(
      "create-room",
      (
        { user, gameMode }: { user: Omit<Player, "socketId">; gameMode: GameMode },
        callback: (room: Room) => void
      ) => {
        const player: Player = { ...user, socketId: socket.id };
        const room = gameService.createRoom(player);
        gameService.setGameMode(room.id, gameMode);
        socket.join(room.id);
        socketPlayerMap.set(socket.id, { playerId: player.id, roomId: room.id });
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
          socketPlayerMap.set(socket.id, { playerId: player.id, roomId: roomId });
          callback({ room });
          notifyRoomUpdate(roomId, room);
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
        const room = gameService.setGameMode(roomId, gameMode);
        notifyRoomUpdate(roomId, room);
      }
    );

    socket.on(
      "start-game",
      ({ roomId, playerId }: { roomId: string; playerId: string }) => {
        const room = gameService.startGame(roomId, playerId, notifyCallback);
        notifyRoomUpdate(roomId, room);
        notifyAvailableRoomsUpdate();
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
        const room = gameService.updatePlayerPosition(roomId, playerId, newPos);
        if (room) notifyRoomUpdate(roomId, room);
      }
    );

    socket.on(
      "player-ability",
      ({ roomId, playerId }: { roomId: string; playerId: string }) => {
        const room = gameService.activateAbility(roomId, playerId);
        if (room) notifyRoomUpdate(roomId, room);
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
        const room = gameService.submitGuess(roomId, playerId, guess);
        if (room) notifyRoomUpdate(roomId, room);
      }
    );

    socket.on(
      "leave-room",
      ({ roomId, playerId }: { roomId: string; playerId: string }) => {
        const { updatedRoom, roomWasDeleted } = gameService.leaveRoom(
          roomId,
          playerId
        );
        socket.leave(roomId);
        if (roomWasDeleted) {
          console.log(`Room ${roomId} was deleted.`);
        } else {
          notifyRoomUpdate(roomId, updatedRoom);
          console.log(`Player ${playerId} left room ${roomId}`);
        }
        notifyAvailableRoomsUpdate();
      }
    );

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      const playerInfo = socketPlayerMap.get(socket.id);
      if (playerInfo) {
        const { playerId, roomId } = playerInfo;
        const { updatedRoom, roomWasDeleted } = gameService.leaveRoom(
          roomId,
          playerId
        );
        socketPlayerMap.delete(socket.id);
        if (roomWasDeleted) {
          console.log(`Room ${roomId} was deleted after player disconnect.`);
        } else {
          notifyRoomUpdate(roomId, updatedRoom);
          console.log(
            `Player ${playerId} was removed from room ${roomId} on disconnect.`
          );
        }
        notifyAvailableRoomsUpdate();
      }
    });
  });
};