
import React from "react";
import { motion } from "framer-motion";
import type { Player } from "../types";
import { INFECTED_COLOR } from "@constants/index";
import { useGame } from "@contexts/GameContext";
import { GameMode } from "../types/index";
import { FreezeIcon } from "./icons";

interface PlayerAvatarProps {
  player: Player;
  cellSize: number;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, cellSize }) => {
  const { revealedHidersUntil, room, user } = useGame();

  if (player.isEliminated) return null;

  const self = room?.players.find((p) => p.id === user?.id);
  const now = Date.now();

  // Hide and Seek visibility logic
  if (room?.gameMode === GameMode.HIDE_AND_SEEK && room.gameState.status === "playing" && self) {
    if (self.isSeeker) { // Viewer is a Seeker
      if (!player.isSeeker && !player.isCaught) { // Player to render is a Hider
        const distance = Math.hypot(self.x - player.x, self.y - player.y);
        const isVisibleInFog = distance <= 7.5;
        const isRevealedByAbility = revealedHidersUntil && now < revealedHidersUntil;
        if (isVisibleInFog) {
          // It's visible, so we proceed to render the full avatar below.
        } else if (isRevealedByAbility) {
          // Not in fog, but revealed by ability. Show highlight.
          return (
            <motion.div
              layout
              className="absolute"
              style={{
                left: player.x * cellSize, top: player.y * cellSize,
                width: cellSize, height: cellSize, zIndex: 15,
              }}
            >
              <div
                className="w-full h-full rounded-md animate-pulse ring-2 ring-warning shadow-lg shadow-warning/80"
                style={{ backgroundColor: player.color, opacity: 0.6 }}
              ></div>
            </motion.div>
          );
        } else {
          // Not in fog, not revealed. Hide completely.
          return null;
        }
      }
    } else { // Viewer is a Hider
      if (player.id !== self.id && !player.isSeeker) return null; // Hide other Hiders
    }
  }
  
  const isShielded = player.shieldUntil && now < player.shieldUntil;
  const isFrozen = player.effects?.some(e => e.type === "frozen" && e.expires > now);
  const isSlowed = player.effects?.some(e => e.type === "slow" && e.expires > now);
  const finalColor = player.isInfected ? INFECTED_COLOR : player.color;
  const isSelf = player.id === user?.id;

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute flex flex-col items-center justify-center"
      style={{
        left: player.x * cellSize,
        top: player.y * cellSize,
        width: cellSize,
        height: cellSize,
        zIndex: player.isSeeker ? 10 : (isSelf ? 6 : 5),
      }}
    >
      <div 
        className="w-full h-full p-[8%] transition-all duration-200"
        style={{ filter: `drop-shadow(0 0 5px ${finalColor}) ${isSlowed ? 'brightness(0.7)' : 'brightness(1)'}` }}
      >
        <div
          className="relative w-full h-full rounded-md flex items-center justify-center text-on-primary font-bold text-sm"
          style={{ 
            backgroundColor: finalColor,
            transform: player.isCaught ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: player.isCaught ? 0.5 : 1,
            transition: 'transform 0.3s ease, opacity 0.3s ease'
          }}
        >
          {isFrozen && <FreezeIcon className="w-3/4 h-3/4 text-on-primary/80 animate-pulse" />}

          {/* Effects and statuses as rings/overlays */}
          {player.isIt && <div className="absolute inset-0 rounded-md ring-2 ring-offset-2 ring-offset-background ring-error animate-pulse" />}
          {isShielded && <div className="absolute inset-0 rounded-md ring-2 ring-offset-2 ring-offset-background ring-primary animate-subtle-glow" />}
          {player.isSeeker && <div className="absolute inset-0 rounded-md ring-2 ring-error" />}

        </div>
      </div>
      <div 
        className="absolute -bottom-4 bg-background/60 text-text-primary text-[10px] px-1.5 py-0.5 rounded-md whitespace-nowrap"
        style={{ opacity: isSelf ? 1 : 0.8 }}
      >
        {player.name}
      </div>
    </motion.div>
  );
};

export default PlayerAvatar;
