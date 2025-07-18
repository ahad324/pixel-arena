import React from "react";
import type { Player, Room } from "../../types/index";
import { GameMode } from "../../types/index";
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

  if (
    room.gameMode !== GameMode.HEIST_PANIC ||
    room.gameState.status !== "playing"
  )
    return null;

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleGuessSubmit}
        onTouchStart={handleGuessSubmit}
        disabled={!!isFrozen}
        className="w-full bg-warning hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors disabled:bg-surface-200 disabled:text-text-secondary disabled:cursor-not-allowed"
      >
        {isFrozen
          ? "Frozen!"
          : `Attempt Guess${!isMobile ? " (Press Space)" : ""}`}
      </button>
    </div>
  );
};

export default HeistPanicUI;