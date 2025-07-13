import React, {
  useState,
  useRef,
  TouchEvent,
  useEffect,
  useCallback,
} from "react";
import { socketService } from "@services/socketService";
import type { Room, Player } from "../types";

interface VirtualJoystickProps {
  room: Room;
  user: Omit<Player, "socketId">;
}

const joystickSize = 120;
const thumbSize = 60;
const moveIntervalTime = 120; // ms, similar to holding a key

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ room, user }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 });
  const moveInterval = useRef<number | null>(null);
  const lastDirection = useRef<string | null>(null);
  const touchId = useRef<number | null>(null);

  // Use a ref to hold the latest room data to avoid stale closures in setInterval
  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const stopMovement = useCallback(() => {
    setThumbPos({ x: 0, y: 0 });
    if (moveInterval.current) {
      clearInterval(moveInterval.current);
      moveInterval.current = null;
    }
    lastDirection.current = null;
    touchId.current = null;
  }, []);

  const handleMove = useCallback(
    (direction: string) => {
      const moveFn = () => {
        const currentRoom = roomRef.current; // Get latest room from ref
        const currentPlayer = currentRoom.players.find((p) => p.id === user.id);
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
        socketService.updatePlayerPosition(currentRoom.id, user.id, { x, y });
      };

      if (direction !== lastDirection.current) {
        if (moveInterval.current) clearInterval(moveInterval.current);
        moveFn(); // Move immediately on direction change
        moveInterval.current = window.setInterval(moveFn, moveIntervalTime);
        lastDirection.current = direction;
      }
    },
    [user.id, stopMovement]
  );

  const updateThumb = useCallback(
    (touchX: number, touchY: number) => {
      if (!baseRef.current) return;
      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = touchX - centerX;
      let dy = touchY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radius = (joystickSize - thumbSize) / 2;

      if (distance > radius) {
        dx = (dx / distance) * radius;
        dy = (dy / distance) * radius;
      }

      setThumbPos({ x: dx, y: dy });

      // Dead zone in the center to make it easier to stop
      if (distance < radius / 2) {
        stopMovement();
        return;
      }

      const angle = Math.atan2(dy, dx);
      let direction: string;

      if (angle > -Math.PI / 4 && angle <= Math.PI / 4) {
        direction = "right";
      } else if (angle > Math.PI / 4 && angle <= (3 * Math.PI) / 4) {
        direction = "down";
      } else if (angle > (3 * Math.PI) / 4 || angle <= (-3 * Math.PI) / 4) {
        direction = "left";
      } else {
        direction = "up";
      }
      handleMove(direction);
    },
    [handleMove, stopMovement]
  );

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (touchId.current !== null) return; // Already tracking a touch
    const touch = e.changedTouches[0];
    if (!touch) return;
    touchId.current = touch.identifier;
    updateThumb(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch && touch.identifier === touchId.current) {
        e.preventDefault();
        updateThumb(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch && touch.identifier === touchId.current) {
        stopMovement();
        break;
      }
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (moveInterval.current) {
        clearInterval(moveInterval.current);
      }
    };
  }, []);

  return (
    <div
      ref={baseRef}
      className="fixed bottom-6 left-6 z-50 rounded-full bg-black/20 backdrop-blur-sm"
      style={{ width: joystickSize, height: joystickSize }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className="absolute rounded-full bg-white/40"
        style={{
          width: thumbSize,
          height: thumbSize,
          top: (joystickSize - thumbSize) / 2 + thumbPos.y,
          left: (joystickSize - thumbSize) / 2 + thumbPos.x,
          transition: "top 50ms, left 50ms",
        }}
      ></div>
    </div>
  );
};

export default VirtualJoystick;