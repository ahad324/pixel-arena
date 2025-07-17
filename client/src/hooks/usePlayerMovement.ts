import { useEffect, useCallback, useRef } from "react";
import { socketService } from "@services/socketService";
import type { Player, Room } from "../types";
import { GameMode } from "../types";

const MOVE_INTERVAL_MS = 120; // ms, similar to holding a key

export const usePlayerMovement = (
  user: Omit<Player, "socketId">,
  room: Room | null,
  isMobile: boolean
) => {
  const roomRef = useRef(room);
  const userRef = useRef(user);
  const moveInterval = useRef<number | null>(null);
  const lastDirection = useRef<string | null>(null);

  useEffect(() => {
    roomRef.current = room;
    userRef.current = user;
  }, [room, user]);

  const stopMovement = useCallback(() => {
    if (moveInterval.current) {
      clearInterval(moveInterval.current);
      moveInterval.current = null;
    }
    lastDirection.current = null;
  }, []);

  const handleMove = useCallback(
    (direction: string) => {
      const moveFn = () => {
        const currentRoom = roomRef.current;
        const currentUser = userRef.current;
        if (!currentRoom || !currentUser) {
          stopMovement();
          return;
        }
        const currentPlayer = currentRoom.players.find(
          (p) => p.id === currentUser.id
        );
        if (!currentPlayer || currentRoom.gameState.status !== "playing") {
          stopMovement();
          return;
        }

        let { x, y } = currentPlayer;
        switch (direction) {
          case "up":
            y -= 1;
            break;
          case "down":
            y += 1;
            break;
          case "left":
            x -= 1;
            break;
          case "right":
            x += 1;
            break;
        }
        socketService.updatePlayerPosition(currentRoom.id, currentUser.id, {
          x,
          y,
        });
      };

      if (direction !== lastDirection.current) {
        stopMovement();
        moveFn(); // Move immediately on direction change
        moveInterval.current = window.setInterval(moveFn, MOVE_INTERVAL_MS);
        lastDirection.current = direction;
      }
    },
    [stopMovement]
  );

  const handleMoveEnd = useCallback(() => {
    stopMovement();
  }, [stopMovement]);

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
        (p) =>
          Math.abs(p.x - currentPlayer.x) < 50 &&
          Math.abs(p.y - currentPlayer.y) < 50
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
      if (event.repeat) return;
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

      let direction: string | null = null;
      switch (event.key) {
        case "ArrowUp":
        case "w":
          direction = "up";
          break;
        case "ArrowDown":
        case "s":
          direction = "down";
          break;
        case "ArrowLeft":
        case "a":
          direction = "left";
          break;
        case "ArrowRight":
        case "d":
          direction = "right";
          break;
        default:
          return;
      }

      if (direction) {
        event.preventDefault();
        handleMove(direction);
      }
    },
    [handleAction, handleMove]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        ArrowUp: "up",
        w: "up",
        ArrowDown: "down",
        s: "down",
        ArrowLeft: "left",
        a: "left",
        ArrowRight: "right",
        d: "right",
      };
      const direction = keyMap[event.key];
      if (direction && direction === lastDirection.current) {
        handleMoveEnd();
      }
    },
    [handleMoveEnd]
  );

  useEffect(() => {
    if (isMobile) return;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      stopMovement(); // Clean up on unmount
    };
  }, [handleKeyDown, handleKeyUp, isMobile, stopMovement]);

  return { handleAction, handleMove, handleMoveEnd };
};

