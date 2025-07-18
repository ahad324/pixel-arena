
import React from "react";
import type { Room } from "../types/index";

const GameControls: React.FC<{
  room: Room;
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}> = ({ room, isHost, onStartGame, onLeaveRoom }) => {
  return (
    <>
      {room.gameState.status === "waiting" && isHost && (
        <button
          onClick={onStartGame}
          disabled={room.players.length < 1}
          className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-all duration-200 disabled:bg-surface-200 disabled:text-text-secondary disabled:cursor-not-allowed mt-2 transform hover:scale-105 disabled:hover:scale-100"
        >
          Start Game
        </button>
      )}
      <button
        onClick={onLeaveRoom}
        className="w-full mt-2 bg-error/80 hover:bg-error text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-all duration-200 transform hover:scale-105"
      >
        Leave Room
      </button>
    </>
  );
};

export default GameControls;
