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
  const showScores =
    room.gameMode === GameMode.TAG ||
    room.gameMode === GameMode.TERRITORY_CONTROL ||
    room.gameMode === GameMode.SPY_AND_DECODE;

  let sortedPlayers = [...room.players];
  if (room.gameMode === GameMode.TRAP_RUSH && winner && "id" in winner) {
    sortedPlayers = [
      room.players.find((p) => p.id === winner.id)!,
      ...room.players
        .filter((p) => p.id !== winner.id)
        .sort((a, b) => a.id.localeCompare(b.id)),
    ];
  } else {
    sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  }

  const winnerName = winner && "name" in winner ? winner.name : "Game Over!";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface-100 border border-border rounded-lg p-8 shadow-2xl shadow-primary/20 max-w-lg w-full text-center transform animate-scale-in">
        <TrophyIcon className="h-20 w-20 text-yellow-400 mx-auto mb-4 animate-bounce-subtle" />
        <h1 className="text-4xl font-bold mb-2 animate-slide-up text-text-primary">{winnerName}</h1>
        <p className="text-text-secondary mb-6 animate-fade-in">Results for {room.gameMode}</p>
        <div className="space-y-3 text-left max-h-60 overflow-y-auto pr-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className="bg-surface-200 p-3 rounded-lg flex justify-between items-center transition-all duration-200 hover:bg-border animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center">
                <span className="font-bold text-lg mr-4 text-text-secondary">
                  #{index + 1}
                </span>
                <div
                  className="w-5 h-5 rounded-full mr-3"
                  style={{ backgroundColor: player.color }}
                ></div>
                <span className="font-semibold text-lg text-text-primary">{player.name}</span>
              </div>
              {showScores && (
                <div className="font-bold text-xl text-primary">
                  {player.score} pts
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onBackToLobby}
          className="mt-8 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transform hover:scale-105 transition-all duration-200 animate-slide-up"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
};

export default EndScreen;