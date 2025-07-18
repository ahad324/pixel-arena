
import React from "react";
import type { Player } from "../types";
import { INFECTED_COLOR } from "@constants/index";
import { FreezeIcon } from "@components/icons";

interface PlayerAvatarProps {
  player: Player;
  cellSize: number;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, cellSize }) => {
  if (player.isEliminated) {
    return null;
  }

  const now = Date.now();
  const isShielded = player.shieldUntil && now < player.shieldUntil;
  const itClass = player.isIt
    ? "shadow-lg shadow-red-500/80 ring-2 ring-red-400 animate-pulse"
    : "";
  const shieldClass = isShielded
    ? "ring-4 ring-cyan-400 ring-offset-2 ring-offset-background animate-pulse"
    : "";

  const isFrozen = player.effects?.some(
    (e) => e.type === "frozen" && e.expires > now
  );
  const isSlowed = player.effects?.some(
    (e) => e.type === "slow" && e.expires > now
  );

  return (
    <div
      className="absolute transition-all duration-100 ease-linear"
      style={{
        left: player.x * cellSize,
        top: player.y * cellSize,
        width: cellSize,
        height: cellSize,
        filter: `drop-shadow(0 2px 4px ${
          player.isInfected ? INFECTED_COLOR : player.color
        }99)`,
        transition: isFrozen ? "none" : "all 100ms linear",
      }}
    >
      <div
        className={`w-full h-full rounded-md flex items-center justify-center transition-all duration-300 ${itClass} ${shieldClass}`}
        style={{
          backgroundColor: player.isInfected ? INFECTED_COLOR : player.color,
          opacity: isSlowed ? 0.7 : 1.0,
        }}
      >
        {isFrozen && (
          <FreezeIcon className="w-3/4 h-3/4 text-white animate-pulse" />
        )}
      </div>
      <div
        className="absolute -top-5 w-full text-center text-xs font-bold whitespace-nowrap transition-all duration-200"
        style={{ color: player.isInfected ? INFECTED_COLOR : player.color }}
      >
        {player.name}
      </div>
    </div>
  );
};

export default PlayerAvatar;
