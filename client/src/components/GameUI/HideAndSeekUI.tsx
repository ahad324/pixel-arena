
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Player, Room } from "@custom-types/index";
import { GameMode } from "@custom-types/index";
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

  if (room.gameMode !== GameMode.HIDE_AND_SEEK || room.gameState.status !== "playing" || !self?.isSeeker) {
    return null;
  }

  const isDisabled = cooldown > 0;

  const handleAction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isDisabled) onAction();
  };

  return (
    <motion.button
      onClick={handleAction}
      onTouchStart={handleAction}
      disabled={isDisabled}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      className="w-full bg-gradient-to-r from-info to-primary text-text-on-primary font-bold px-2 py-3 sm:py-3 sm:px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <SpyIcon className="w-5 h-5" />
      {isDisabled
        ? `Reveal (${cooldown}s)`
        : `Reveal Hiders${!isMobile ? " (Space)" : ""}`}
    </motion.button>
  );
};

export default HideAndSeekUI;
