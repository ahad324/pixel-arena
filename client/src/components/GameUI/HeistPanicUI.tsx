import React, { useState, useEffect } from "react";
import type { Player, Room, CodePad } from "../../types/index";
import { GameMode } from "../../types/index";
import { socketService } from "@services/socketService";
import { useDeviceDetection } from "@hooks/useDeviceDetection";

const HeistPanicUI: React.FC<{
  room: Room;
  user: Omit<Player, "socketId">;
}> = ({ room, user }) => {
  const [isOnPad, setIsOnPad] = useState(false);
  const [padId, setPadId] = useState<string | null>(null);
  const self = room.players.find((p) => p.id === user.id);
  const { isMobile } = useDeviceDetection();
  const isFrozen = self?.effects?.some(
    (effect) => effect.type === "frozen" && effect.expires > Date.now()
  );

  // Check if player is on a code pad
  useEffect(() => {
    if (self && room.gameMode === GameMode.HEIST_PANIC && room.gameState.status === "playing") {
      const heistState = room.gameState;
      if (heistState && heistState.codePads) {
        const padPlayerIsOn = heistState.codePads.find(
          (pad: CodePad) => Math.abs(pad.x - self.x) < 50 && Math.abs(pad.y - self.y) < 50
        );
        setIsOnPad(!!padPlayerIsOn);
        setPadId(padPlayerIsOn ? padPlayerIsOn.id : null);
      }
    }
  }, [self, room.gameMode, room.gameState]);

  // Handle space key press for guess submission
  useEffect(() => {
    if (room.gameMode !== GameMode.HEIST_PANIC || room.gameState.status !== "playing") return;
    
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" && isOnPad) {
        event.preventDefault();
        handleGuessSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOnPad, room.gameMode, room.gameState.status]);

  const handleGuessSubmit = () => {
    if (self && isOnPad && padId && !isFrozen) {
      socketService.submitHeistGuess(room.id, user.id, padId);
    }
  };

  if (room.gameMode !== GameMode.HEIST_PANIC || room.gameState.status !== "playing") return null;
  if (!isOnPad) return null;

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleGuessSubmit}
        disabled={!!isFrozen}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isFrozen
          ? "Frozen!"
          : `Attempt Guess${!isMobile ? " (Press Space)" : ""}`}
      </button>
    </div>
  );
};

export default HeistPanicUI;

