import React from "react";
import type { Player } from "../types";
import { INFECTED_COLOR } from "@constants/index";
import { FreezeIcon } from "@components/icons";
import { useGame } from "@contexts/GameContext";
import { GameMode } from "../types/index";

interface PlayerAvatarProps {
  player: Player;
  cellSize: number;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, cellSize }) => {
  const { revealedHidersUntil, room, user } = useGame();

  if (player.isEliminated) {
    return null;
  }

  const self = room?.players.find((p) => p.id === user?.id);
  const now = Date.now();

  // Hide and Seek visibility logic
  if (
    room?.gameMode === GameMode.HIDE_AND_SEEK &&
    room.gameState.status === "playing" &&
    self
  ) {
    // Viewer is a Seeker
    if (self.isSeeker) {
      // Player to be rendered is a Hider
      if (!player.isSeeker && !player.isCaught) {
        const distance = Math.hypot(self.x - player.x, self.y - player.y);
        const visibilityRadius = 7.5; // From GameBoard fog of war for seekers
        const isVisibleInFog = distance <= visibilityRadius;

        if (isVisibleInFog) {
          // It's visible, so we proceed to render the full avatar below.
        } else {
          const isRevealed = revealedHidersUntil && now < revealedHidersUntil;
          if (isRevealed) {
            // Not in fog, but revealed by ability. Show highlight.
            return (
              <div
                className="absolute"
                style={{
                  left: player.x * cellSize, top: player.y * cellSize,
                  width: cellSize, height: cellSize, zIndex: 15,
                }}
              >
                <div
                  className="w-full h-full rounded-md animate-pulse ring-2 ring-yellow-300 shadow-lg shadow-yellow-300/80"
                  style={{ backgroundColor: player.color, opacity: 0.6 }}
                ></div>
              </div>
            );
          } else {
            // Not in fog, not revealed. Hide completely.
            return null;
          }
        }
      }
    }
    // Viewer is a Hider
    else {
      // Hide other Hiders. Allow self and seekers to be seen.
      if (player.id !== self.id && !player.isSeeker) {
        return null;
      }
    }
  }

  const isShielded = player.shieldUntil && now < player.shieldUntil;
  const itClass = player.isIt
    ? "shadow-lg shadow-red-500/80 ring-2 ring-red-400 animate-pulse"
    : "";
  const shieldClass = isShielded
    ? "ring-4 ring-cyan-400 ring-offset-2 ring-offset-background animate-pulse"
    : "";

  const seekerClass = player.isSeeker
    ? "ring-2 ring-offset-2 ring-offset-background ring-red-500"
    : "";

  const caughtClass = player.isCaught ? "opacity-50 animate-spin" : "";

  const isFrozen = player.effects?.some(
    (e) => e.type === "frozen" && e.expires > now
  );
  const isSlowed = player.effects?.some(
    (e) => e.type === "slow" && e.expires > now
  );

  const finalColor = player.isInfected ? INFECTED_COLOR : player.color;

  return (
    <div
      className={`absolute transition-all duration-100 ease-linear ${caughtClass}`}
      style={{
        left: player.x * cellSize,
        top: player.y * cellSize,
        width: cellSize,
        height: cellSize,
        filter: `drop-shadow(0 2px 4px ${finalColor}99)`,
        transition: isFrozen ? "none" : "all 100ms linear",
        zIndex: player.isSeeker ? 10 : 5,
      }}
    >
      <div
        className={`w-full h-full rounded-md flex items-center justify-center transition-all duration-300 ${itClass} ${shieldClass} ${seekerClass}`}
        style={{
          backgroundColor: finalColor,
          opacity: isSlowed ? 0.7 : 1.0,
        }}
      >
        {isFrozen && (
          <FreezeIcon className="w-3/4 h-3/4 text-white animate-pulse" />
        )}
      </div>
      <div
        className="absolute -top-5 w-full text-center text-xs font-bold whitespace-nowrap transition-all duration-200"
        style={{ color: finalColor }}
      >
        {player.name}
      </div>
    </div>
  );
};

export default PlayerAvatar;
