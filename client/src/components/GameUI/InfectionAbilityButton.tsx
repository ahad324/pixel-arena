import React, { useState, useEffect } from "react";
import type { Player, Room } from "../../types/index";
import { GameMode } from "../../types/index";
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
  const { SPRINT_COOLDOWN, SHIELD_COOLDOWN } =
    GAME_SETTINGS[GameMode.INFECTION_ARENA];

  useEffect(() => {
    let intervalId: number | undefined;
    if (
      self &&
      room.gameMode === GameMode.INFECTION_ARENA &&
      room.gameState.status === "playing"
    ) {
      intervalId = window.setInterval(() => {
        const now = Date.now();
        const lastUsed = self.isInfected
          ? self.lastSprintTime
          : self.lastShieldTime;
        const totalCooldown = self.isInfected
          ? SPRINT_COOLDOWN
          : SHIELD_COOLDOWN;
        if (lastUsed) {
          const remaining = Math.max(0, totalCooldown - (now - lastUsed));
          setCooldown(Math.ceil(remaining / 1000));
        } else {
          setCooldown(0);
        }
      }, 500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    self,
    room.gameMode,
    room.gameState.status,
    SPRINT_COOLDOWN,
    SHIELD_COOLDOWN,
  ]);

  if (room.gameMode !== GameMode.INFECTION_ARENA) return null;

  const abilityName = self?.isInfected ? "Sprint" : "Shield";
  const isDisabled = cooldown > 0;

  return (
    <button
      onClick={onAction}
      disabled={isDisabled}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
    >
      {isDisabled
        ? `${abilityName} (${cooldown}s)`
        : `Use ${abilityName}${!isMobile ? " (Space)" : ""}`}
    </button>
  );
};

export default InfectionAbilityButton;