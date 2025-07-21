
import React from "react";
import type { Room, Player } from "../types";
import { GameMode } from "../types";
import { TrophyIcon } from "./icons";
import { motion } from "framer-motion";

interface EndScreenProps {
  room: Room;
  onBackToLobby: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ room, onBackToLobby }) => {
  const { winner } = room.gameState;
  const showScores = [GameMode.TAG, GameMode.TERRITORY_CONTROL, GameMode.SPY_AND_DECODE].includes(room.gameMode);

  let sortedPlayers: Player[] = [...room.players];

  if (room.gameMode === GameMode.INFECTION_ARENA) {
    sortedPlayers = winner?.name === "Survivors"
      ? sortedPlayers.filter(p => !p.isInfected)
      : sortedPlayers.filter(p => p.isInfected).sort((a, b) => a.name.localeCompare(b.name));
  } else {
    sortedPlayers.sort((a, b) => b.score - a.score);
  }

  const winnerName = winner && typeof winner === "object" && "name" in winner ? winner.name : "Game Over!";

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-surface-100 border border-border rounded-3xl p-8 shadow-2xl max-w-lg w-full text-center"
      >
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
        >
            <TrophyIcon className="h-20 w-20 text-warning mx-auto mb-4" />
        </motion.div>
        
        <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black mb-2 text-text-primary"
        >
            {winnerName}
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-text-secondary mb-8"
        >
            Results for {room.gameMode}
        </motion.p>
        
        <div className="space-y-3 text-left max-h-60 overflow-y-auto pr-2 scrollbar-thin">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-surface-200 border border-border p-3 rounded-xl flex justify-between items-center hover:bg-surface-100 transition-colors"
            >
              <div className="flex items-center">
                <span className="font-bold text-lg mr-4 text-text-secondary">#{index + 1}</span>
                <div
                  className="w-5 h-5 rounded-full mr-3"
                  style={{ backgroundColor: player.color }}
                />
                <span className="font-semibold text-lg text-text-primary">{player.name}</span>
              </div>
              {showScores && (
                <div className="font-bold text-xl text-primary">{player.score} pts</div>
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.button
          onClick={onBackToLobby}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + sortedPlayers.length * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 w-full bg-primary hover:bg-primary-hover text-on-primary font-bold py-3 px-4 rounded-xl focus:outline-none transition-all duration-200"
        >
          Back to Lobby
        </motion.button>
      </motion.div>
    </div>
  );
};

export default EndScreen;
