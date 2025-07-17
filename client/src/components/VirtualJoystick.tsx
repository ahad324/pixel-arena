import React, { CSSProperties } from "react";

interface VirtualJoystickProps {
  joystickState: {
    position: { x: number; y: number };
    thumbPosition: { x: number; y: number };
    isActive: boolean;
  };
}

const JOYSTICK_SIZE = 80; // px
const THUMB_SIZE = 40; // px

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  joystickState,
}) => {
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
    pointerEvents: "none", // Pass touches through to the game area
  };

  const thumbStyle: CSSProperties = {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    top: (JOYSTICK_SIZE - THUMB_SIZE) / 2 + joystickState.thumbPosition.y,
    left: (JOYSTICK_SIZE - THUMB_SIZE) / 2 + joystickState.thumbPosition.x,
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

