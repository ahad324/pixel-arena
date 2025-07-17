import React, { useState, useRef, useCallback, CSSProperties } from "react";
import { socketService } from "@services/socketService";
import type { Room, Player } from "../types";

interface VirtualJoystickProps {
  roomRef: React.RefObject<Room>;
  user: Omit<Player, "socketId">;
  onMove: (direction: string) => void;
  onMoveEnd: () => void;
  joystickState: {
    position: { x: number; y: number };
    isActive: boolean;
  };
}

const JOYSTICK_SIZE = 100; // px
const THUMB_SIZE = 50; // px

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onMoveEnd,
  joystickState,
}) => {
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 });

  const updateThumb = useCallback(
    (touchX: number, touchY: number) => {
      if (!joystickState.isActive) return;

      const { x: centerX, y: centerY } = joystickState.position;

      let dx = touchX - centerX;
      let dy = touchY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radius = (JOYSTICK_SIZE - THUMB_SIZE) / 2;

      if (distance > radius) {
        dx = (dx / distance) * radius;
        dy = (dy / distance) * radius;
      }

      setThumbPos({ x: dx, y: dy });

      // Dead zone in the center
      if (distance < radius / 3) {
        onMoveEnd();
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
      onMove(direction);
    },
    [joystickState.isActive, joystickState.position, onMove, onMoveEnd]
  );

  // This effect will be triggered from the parent component's touch move
  // We can't use local touch events anymore as the joystick position is dynamic
  // The parent will pass the touch coordinates to this function
  // For now, we assume the parent handles passing the move events.
  // Let's refine this logic in GamePage.tsx

  if (!joystickState.isActive) {
    return null;
  }

  const baseStyle: CSSProperties = {
    position: "fixed",
    top: joystickState.position.y - JOYSTICK_SIZE / 2,
    left: joystickState.position.x - JOYSTICK_SIZE / 2,
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(2px)",
    zIndex: 50,
    touchAction: "none", // Prevent scrolling
  };

  const thumbStyle: CSSProperties = {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    top: (JOYSTICK_SIZE - THUMB_SIZE) / 2 + thumbPos.y,
    left: (JOYSTICK_SIZE - THUMB_SIZE) / 2 + thumbPos.x,
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    transition: "top 50ms, left 50ms",
  };

  return (
    <div style={baseStyle}>
      <div style={thumbStyle}></div>
    </div>
  );
};

export default VirtualJoystick;

