import React from "react";
import { motion } from "framer-motion";
import type { Player } from "@custom-types/index";
import { INFECTED_COLOR } from "@constants/index";
import { useGame } from "@contexts/GameContext";
import { GameMode } from "@custom-types/index";
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
  const isSelf = player.id === user?.id;
  const isHnS = room?.gameMode === GameMode.HIDE_AND_SEEK && room.gameState.status === 'playing';

  // change from: a complex, nested if/else block with multiple return points.
  // to: a single, unified visibility check at the start of the component.
  // because: This fixes a bug where hiders inside the fog of war would not render correctly and simplifies the logic. It ensures a single source of truth for visibility before rendering.
  if (isHnS && self) {
    if (self.isSeeker) { // Seeker's view
      if (!player.isSeeker && !player.isCaught) { // Rendering a Hider
        const distance = Math.hypot(self.x - player.x, self.y - player.y);
        const isVisibleInFog = distance <= 7.5;
        const isRevealedByAbility = revealedHidersUntil && now < revealedHidersUntil;

        if (!isVisibleInFog && !isRevealedByAbility) {
          return null; // Hide hiders who are outside fog and not revealed.
        }
      }
    } else { // Hider's view
      // Hiders should only see themselves and any seekers.
      if (!player.isSeeker && player.id !== self.id) {
        return null;
      }
    }
  }

  const isShielded = player.shieldUntil && now < player.shieldUntil;
  const isFrozen = player.effects?.some(e => e.type === "frozen" && e.expires > now);
  const isSlowed = player.effects?.some(e => e.type === "slow" && e.expires > now);
  const finalColor = player.isInfected ? INFECTED_COLOR : player.color;

  // Added a flag to check if a hider is currently revealed by the seeker's ability.
  const isRevealedHider = isHnS && self?.isSeeker && !player.isSeeker && !player.isCaught && revealedHidersUntil && now < revealedHidersUntil;

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
        // change from: static z-index logic
        // to: dynamic z-index based on `isRevealedHider`.
        // because: This ensures revealed hiders appear on top of the fog of war (which is at z-20).
        zIndex: isRevealedHider ? 25 : (player.isSeeker ? 10 : (isSelf ? 6 : 5)),
      }}
    >
      <div
        className="w-full h-full p-[8%] transition-all duration-200"
        style={{ filter: `drop-shadow(0 0 5px ${finalColor}) ${isSlowed ? 'brightness(0.7)' : 'brightness(1)'}` }}
      >
        <div
          className="relative w-full h-full rounded-md flex items-center justify-center text-text-on-primary font-bold text-sm"
          style={{
            backgroundColor: finalColor,
            transform: player.isCaught ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: player.isCaught ? 0.5 : 1,
            transition: 'transform 0.3s ease, opacity 0.3s ease'
          }}
        >
          {isFrozen && <FreezeIcon className="w-3/4 h-3/4 text-text-on-primary/80 animate-pulse" />}

          {/* Effects and statuses as rings/overlays */}
          {/* change from: ring-error to ring-it-highlight for semantic color theming. */}
          {player.isIt && <div className="absolute inset-0 rounded-md ring-2 ring-offset-2 ring-offset-background ring-it-highlight animate-pulse" />}
          {/* Added highlight for infected players as requested for better role visibility. */}
          {player.isInfected && <div className="absolute inset-0 rounded-md ring-2 ring-offset-2 ring-offset-background ring-infected-highlight animate-pulse" />}

          {isShielded && <div className="absolute inset-0 rounded-md ring-2 ring-offset-2 ring-offset-background ring-primary animate-subtle-glow" />}

          {/* change from: ring-error to ring-seeker-highlight for a distinct, themable seeker color. */}
          {player.isSeeker && <div className="absolute inset-0 rounded-md ring-2 ring-seeker-highlight" />}

          {/* Added highlight for the seeker's "reveal" ability. */}
          {isRevealedHider && <div className="absolute inset-0 rounded-md ring-2 ring-offset-2 ring-offset-background ring-reveal-highlight animate-pulse" />}
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
