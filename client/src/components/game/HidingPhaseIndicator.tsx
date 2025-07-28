import React, { useState, useEffect } from "react";
import type { Room } from "@custom-types/index";

const HidingPhaseIndicator: React.FC<{ room: Room }> = ({ room }) => {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!room.gameState.seekerFreezeUntil) return;
    const calculateCountdown = () => {
      const remaining = room.gameState.seekerFreezeUntil! - Date.now();
      setCountdown(remaining > 0 ? Math.ceil(remaining / 1000) : 0);
    };
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 500);
    return () => clearInterval(interval);
  }, [room.gameState.seekerFreezeUntil]);

  if (countdown <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-primary/20 to-accent-secondary/20 backdrop-blur-sm border border-primary/30 rounded-xl p-4 mb-4 text-center">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <p className="font-bold text-primary">Hiders are hiding!</p>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      </div>
      <p className="text-sm text-text-secondary">Seekers unfreeze in {countdown}s</p>
    </div>
  );
};

export default HidingPhaseIndicator;