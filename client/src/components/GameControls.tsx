import React from "react";
import { motion } from "framer-motion";
import type { Room } from "@custom-types/index";
import Loader from "./Loader";

const GameControls: React.FC<{
  room: Room;
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  isProcessing?: boolean;
}> = ({ room, isHost, onStartGame, onLeaveRoom, isProcessing }) => {
  return (
    <div className="flex flex-col gap-3">
      {room.gameState.status === "waiting" && isHost && (
        <motion.button
          onClick={onStartGame}
          disabled={room.players.length < 1 || isProcessing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-accent to-accent-dark text-text-on-primary font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? <Loader className="w-5 h-5 text-text-secondary" text="Starting..." /> : "Start Game"}
        </motion.button>
      )}
      <motion.button
        onClick={onLeaveRoom}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-error to-error-dark text-text-on-primary font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Leave Room
      </motion.button>
    </div>
  );
};

export default GameControls;
