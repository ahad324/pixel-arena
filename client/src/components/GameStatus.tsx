
import React from "react";
import type { Room } from "@custom-types/index";
import { motion } from "framer-motion";

const GameStatus: React.FC<{ room: Room; isFullscreen: boolean }> = ({ room, isFullscreen }) => {
  const getStatusMessage = () => {
    const { status, timer, phase } = room.gameState;
    if (status === "waiting") return { title: "Waiting for host...", subtitle: "The game will begin shortly." };
    if (timer > 0) {
      const formattedTime = new Date(timer * 1000).toISOString().slice(14, 19);
      return {
          title: formattedTime,
          subtitle: phase ? `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase` : "Time Remaining"
      };
    }
    return { title: "Game in Progress", subtitle: "Good luck!" };
  };

  const { title, subtitle } = getStatusMessage();

  const containerClasses = isFullscreen
    ? "absolute top-4 left-1/2 -translate-x-1/2 bg-surface-100/80 backdrop-blur-sm text-text-primary font-bold text-lg md:text-2xl px-6 py-3 rounded-2xl z-10 pointer-events-none shadow-lg border border-border"
    : "bg-surface-200/50 text-text-primary rounded-2xl p-4 text-center border border-border/80";

  return (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={containerClasses}
    >
      <p className="text-2xl tracking-tighter">{title}</p>
      <p className="text-sm text-text-secondary">{subtitle}</p>
    </motion.div>
  );
};

export default GameStatus;
