

import React, { useState, useEffect } from "react";
import type { Player, Room } from "../../types/index";
import { GameMode } from "../../types/index";
import { GAME_SETTINGS } from "@constants/index";
import { useDeviceDetection } from "@hooks/useDeviceDetection";
import { SpyIcon } from "@components/icons";

const HideAndSeekUI: React.FC<{
  room: Room;
  user: Omit<Player, "socketId">;
  onAction: () => void;
}> = ({ room, user, onAction }) => {
  const [cooldown, setCooldown] = useState(0);
  const self = room.players.find((p) => p.id === user.id);
  const { isMobile } = useDeviceDetection();
  const { REVEAL_COOLDOWN } = GAME_SETTINGS[GameMode.HIDE_AND_SEEK];

  useEffect(() => {
    if (!self?.isSeeker) return;

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const lastUsed = self.lastRevealTime;
      if (lastUsed) {
        const remaining = Math.max(0, REVEAL_COOLDOWN - (now - lastUsed));
        setCooldown(Math.ceil(remaining / 1000));
      } else {
        setCooldown(0);
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [self, REVEAL_COOLDOWN]);

  if (
    room.gameMode !== GameMode.HIDE_AND_SEEK ||
    room.gameState.status !== "playing" ||
    !self?.isSeeker
  ) {
    return null;
  }

  const isDisabled = cooldown > 0;

  const handleAction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isDisabled) {
      onAction();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleAction}
        onTouchStart={handleAction}
        disabled={isDisabled}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors disabled:bg-surface-200 disabled:text-text-secondary disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <SpyIcon className="w-5 h-5" />
        {isDisabled
          ? `Reveal (${cooldown}s)`
          : `Reveal Hiders${!isMobile ? " (Space)" : ""}`}
      </button>
    </div>
  );
};

export default HideAndSeekUI;