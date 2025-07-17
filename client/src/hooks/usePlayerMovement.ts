import { useEffect, useCallback, useRef } from "react";
import { socketService } from "@services/socketService";
import type { Player, Room } from "../types";
import { GameMode } from "../types";

export const usePlayerMovement = (
  user: Omit<Player, "socketId">,
  room: Room | null,
  isMobile: boolean
) => {
  const roomRef = useRef(room);
  const userRef = useRef(user);

  useEffect(() => {
    roomRef.current = room;
    userRef.current = user;
  }, [room, user]);

  const handleAction = useCallback(() => {
    const currentRoom = roomRef.current;
    const currentUser = userRef.current;
    if (!currentRoom || !currentUser) return;

    const currentPlayer = currentRoom.players.find(
      (p) => p.id === currentUser.id
    );
    if (!currentPlayer || currentRoom.gameState.status !== "playing") return;

    if (currentRoom.gameMode === GameMode.INFECTION_ARENA) {
      socketService.activateAbility(currentRoom.id, currentUser.id);
    } else if (currentRoom.gameMode === GameMode.HEIST_PANIC) {
      const padUnderPlayer = currentRoom.gameState.codePads?.find(
        (p) => p.x === currentPlayer.x && p.y === currentPlayer.y
      );
      if (padUnderPlayer) {
        socketService.submitHeistGuess(
          currentRoom.id,
          currentUser.id,
          padUnderPlayer.id
        );
      }
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const currentRoom = roomRef.current;
      const currentUser = userRef.current;
      if (!currentRoom || !currentUser) return;

      const currentPlayer = currentRoom.players.find(
        (p) => p.id === currentUser.id
      );
      if (!currentPlayer || currentRoom.gameState.status !== "playing") return;

      if (event.key === " ") {
        event.preventDefault();
        handleAction();
        return;
      }

      let { x, y } = currentPlayer;

      switch (event.key) {
        case "ArrowUp":
        case "w":
          y -= 1;
          break;
        case "ArrowDown":
        case "s":
          y += 1;
          break;
        case "ArrowLeft":
        case "a":
          x -= 1;
          break;
        case "ArrowRight":
        case "d":
          x += 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      socketService.updatePlayerPosition(currentRoom.id, currentUser.id, {
        x,
        y,
      });
    },
    [handleAction]
  );

  useEffect(() => {
    if (isMobile) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, isMobile]);

  return { handleAction };
};
