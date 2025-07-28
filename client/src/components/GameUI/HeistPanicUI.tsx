
import React from "react";
import { motion } from "framer-motion";
import type { Player, Room } from "@custom-types/index";
import { GameMode } from "@custom-types/index";
import { useDeviceDetection } from "@hooks/useDeviceDetection";

const HeistPanicUI: React.FC<{
  room: Room;
  user: Omit<Player, "socketId">;
  onGuessSubmit: () => void;
}> = ({ room, user, onGuessSubmit }) => {
  const { isMobile } = useDeviceDetection();
  const self = room.players.find((p) => p.id === user.id);
  const isFrozen = self?.effects?.some(
    (effect) => effect.type === "frozen" && effect.expires > Date.now()
  );

  const handleGuessSubmit = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isFrozen) {
      onGuessSubmit();
    }
  };

  if (room.gameMode !== GameMode.HEIST_PANIC || room.gameState.status !== "playing")
    return null;

  return (
    <motion.button
      onClick={handleGuessSubmit}
      onTouchStart={handleGuessSubmit}
      disabled={!!isFrozen}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-gradient-to-r from-warning to-warning-dark text-text-on-primary font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isFrozen
        ? "Frozen!"
        : `Attempt Guess${!isMobile ? " (Space)" : ""}`}
    </motion.button>
  );
};

export default HeistPanicUI;
