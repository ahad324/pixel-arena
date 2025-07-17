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
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed mt-2 transform hover:scale-105 disabled:hover:scale-100"
        >
          Start Game
        </button>
      )}
      <button
        onClick={onLeaveRoom}
        className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-200 transform hover:scale-105"
      >
        Leave Room
      </button>
    </>
  );
};

export default GameControls;