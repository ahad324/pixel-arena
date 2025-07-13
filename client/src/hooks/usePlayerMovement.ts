import { useEffect, useCallback } from "react";
import { socketService } from "@services/socketService";
import type { Player, Room } from "../types";

export const usePlayerMovement = (
  user: Omit<Player, "socketId">,
  room: Room | null,
  isMobile: boolean
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!room || !user) return;

      const currentPlayer = room.players.find((p) => p.id === user.id);
      if (!currentPlayer || room.gameState.status !== "playing") return;

      if (event.key === " ") {
        event.preventDefault();
        socketService.activateAbility(room.id, user.id);
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
      socketService.updatePlayerPosition(room.id, user.id, { x, y });
    },
    [user, room]
  );

  useEffect(() => {
    if (isMobile) return; // Do not attach listener on mobile devices

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, isMobile]);
};