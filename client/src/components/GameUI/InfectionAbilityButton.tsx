
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Player, Room } from "@custom-types/index";
import { GameMode } from "@custom-types/index";
import { GAME_SETTINGS } from "@constants/index";
import { useDeviceDetection } from "@hooks/useDeviceDetection";

const InfectionAbilityButton: React.FC<{
  room: Room;
  user: Omit<Player, "socketId">;
  onAction: () => void;
}> = ({ room, user, onAction }) => {
  const [cooldown, setCooldown] = useState(0);
  const self = room.players.find((p) => p.id === user.id);
  const { isMobile } = useDeviceDetection();
  const { SPRINT_COOLDOWN, SHIELD_COOLDOWN } = GAME_SETTINGS[GameMode.INFECTION_ARENA];

  useEffect(() => {
    if (!self || room.gameMode !== GameMode.INFECTION_ARENA || room.gameState.status !== "playing") return;
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const lastUsed = self.isInfected ? self.lastSprintTime : self.lastShieldTime;
      const totalCooldown = self.isInfected ? SPRINT_COOLDOWN : SHIELD_COOLDOWN;
      if (lastUsed) {
        const remaining = Math.max(0, totalCooldown - (now - lastUsed));
        setCooldown(Math.ceil(remaining / 1000));
      } else {
        setCooldown(0);
      }
    }, 100);
    return () => clearInterval(intervalId);
  }, [self, room.gameMode, room.gameState.status, SPRINT_COOLDOWN, SHIELD_COOLDOWN]);

  if (room.gameMode !== GameMode.INFECTION_ARENA || !self) return null;

  const abilityName = self.isInfected ? "Sprint" : "Shield";
  const isDisabled = cooldown > 0;
  const buttonGradient = self.isInfected 
    ? "from-accent to-accent-dark"
    : "from-primary to-primary-dark";


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
      className={`w-full bg-gradient-to-r ${buttonGradient} text-text-on-primary font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isDisabled
        ? `${abilityName} (${cooldown}s)`
        : `Use ${abilityName}${!isMobile ? " (Space)" : ""}`}
    </motion.button>
  );
};

export default InfectionAbilityButton;
