
import React, { CSSProperties } from "react";

interface VirtualJoystickProps {
  joystickState: {
    position: { x: number; y: number };
    thumbPosition: { x: number; y: number };
    isActive: boolean;
  };
}

const JOYSTICK_SIZE = 80;
const THUMB_SIZE = 40;

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ joystickState }) => {
  if (!joystickState.isActive) {
    return null;
  }

  const baseStyle: CSSProperties = {
    position: "fixed",
    top: joystickState.position.y - JOYSTICK_SIZE / 2,
    left: joystickState.position.x - JOYSTICK_SIZE / 2,
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    zIndex: 50,
    pointerEvents: "none",
  };

  const thumbStyle: CSSProperties = {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    top: (JOYSTICK_SIZE - THUMB_SIZE) / 2 + joystickState.thumbPosition.y,
    left: (JOYSTICK_SIZE - THUMB_SIZE) / 2 + joystickState.thumbPosition.x,
    borderRadius: "50%",
    backgroundColor: "hsla(var(--text-primary-hsl))",
    transition: "top 50ms, left 50ms",
  };

  return (
    <div style={baseStyle}>
       <div className="absolute inset-0 bg-surface-200 border-2 border-border rounded-full opacity-80" />
      <div style={thumbStyle}></div>
    </div>
  );
};

export default VirtualJoystick;
