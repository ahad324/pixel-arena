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
  const [isPending, setIsPending] = useState(false); // Track pending action
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
          if (remaining === 0) {
            setIsPending(false); // Clear pending state when cooldown ends
          }
        } else {
          setCooldown(0);
          setIsPending(false);
        }
      }, 100); // Reduced interval for smoother updates
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
  const isDisabled = cooldown > 0 || isPending;

  const handleAction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isDisabled) {
      setIsPending(true); // Immediately set pending state
      setCooldown(self?.isInfected ? SPRINT_COOLDOWN / 1000 : SHIELD_COOLDOWN / 1000); // Set initial cooldown
      onAction();
    }
  };

  return (
    <button
      onClick={handleAction}
      onTouchStart={handleAction}
      disabled={isDisabled}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors disabled:bg-surface-200 disabled:text-text-secondary disabled:cursor-not-allowed"
    >
      {isDisabled
        ? `${abilityName} (${cooldown}s)`
        : `Use ${abilityName}${!isMobile ? " (Space)" : ""}`}
    </button>
  );
};

export default InfectionAbilityButton;