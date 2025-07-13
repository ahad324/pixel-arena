import React from "react";
import type { Room } from "../types";
import { GameMode } from "../types";
import { TrophyIcon } from "./icons";

interface EndScreenProps {
  room: Room;
  onBackToLobby: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ room, onBackToLobby }) => {
  const { winner } = room.gameState;
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  const winnerName = winner && "name" in winner ? winner.name : "Game Over!";
  const showScores =
    room.gameMode === GameMode.TAG ||
    room.gameMode === GameMode.TERRITORY_CONTROL ||
    room.gameMode === GameMode.SPY_AND_DECODE;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-2xl shadow-blue-500/20 max-w-lg w-full text-center transform animate-in fade-in zoom-in-95 duration-300">
        <TrophyIcon className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">{winnerName}</h1>
        <p className="text-gray-400 mb-6">Results for {room.gameMode}</p>

        <div className="space-y-3 text-left max-h-60 overflow-y-auto pr-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center">
                <span className="font-bold text-lg mr-4 text-gray-400">
                  #{index + 1}
                </span>
                <div
                  className="w-5 h-5 rounded-full mr-3"
                  style={{ backgroundColor: player.color }}
                ></div>
                <span className="font-semibold text-lg">{player.name}</span>
              </div>
              {showScores && (
                <div className="font-bold text-xl text-blue-300">
                  {player.score} pts
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onBackToLobby}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transform hover:scale-105 transition-transform duration-200"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
};

export default EndScreen;
