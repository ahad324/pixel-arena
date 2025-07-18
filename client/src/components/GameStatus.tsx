
import React from "react";
import type { Room } from "../types";
import { GameMode } from "../types";

const GameStatus: React.FC<{ room: Room; isFullscreen: boolean }> = ({ room, isFullscreen }) => {
  const getStatusMessage = () => {
    const { status, timer, phase } = room.gameState;
    const { gameMode } = room;

    if (status === "waiting") return "Waiting for host to start...";
    if (timer > 0)
      return `${phase
          ? `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase: `
          : "Time Left: "
        }${timer}s`;

    switch (gameMode) {
      case GameMode.TAG:
        return "Don't get tagged!";
      case GameMode.MAZE_RACE:
        return "First to the finish wins!";
      case GameMode.INFECTION_ARENA:
        return "Don't get infected!";
      case GameMode.TRAP_RUSH:
        return "Get to the finish line!";
      case GameMode.SPY_AND_DECODE:
        return "Awaiting next phase...";
      case GameMode.HEIST_PANIC:
        return "First to the correct code wins!";
      default:
        return "";
    }
  };

  const statusMessage = getStatusMessage();

  return isFullscreen ? (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-text-primary font-bold text-lg md:text-2xl px-4 py-2 md:px-6 md:py-3 rounded-xl z-10 pointer-events-none shadow-lg border border-border">
      {statusMessage}
    </div>
  ) : (
    <div className="bg-primary/10 text-primary rounded-md p-3 text-center mb-4 font-semibold border border-primary/20">
      {statusMessage}
    </div>
  );
};

export default GameStatus;
