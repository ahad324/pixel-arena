import React from 'react';
import type { Player, Room } from "../types";
import { GameMode } from "../types";

interface GameStatusDisplayProps {
    room: Room;
    user: Omit<Player, "socketId">;
    className?: string;
}

const getStatusMessage = (room: Room, user: Omit<Player, "socketId">): string => {
    const { status, timer, phase } = room.gameState;
    const { gameMode } = room;
    const you = room.players.find((p) => p.id === user.id);

    if (status === "waiting") return "Waiting for host to start...";
    if (timer > 0)
      return `${
        phase
          ? `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase: `
          : "Time Left: "
      }${timer}s`;

    switch (gameMode) {
      case GameMode.TAG:
        return you?.isIt ? "You are It!" : "Don't get tagged!";
      case GameMode.MAZE_RACE:
        return "First to the finish wins!";
      case GameMode.DODGE_THE_SPIKES:
        return you?.isEliminated ? "You were eliminated!" : "Dodge the spikes!";
      case GameMode.INFECTION_ARENA:
        return you?.isInfected ? "Infect everyone!" : "Don't get infected!";
      case GameMode.TRAP_RUSH:
        return "Get to the finish line!";
      case GameMode.SPY_AND_DECODE:
        return "Awaiting next phase...";
      default:
        return "";
    }
};


const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({ room, user, className }) => {
    const message = getStatusMessage(room, user);

    if (!message) {
        return null;
    }

    return (
        <div className={className}>
            {message}
        </div>
    );
};

export default GameStatusDisplay;
