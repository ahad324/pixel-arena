import React from 'react';
import { motion } from 'framer-motion';
import { GameMode } from '@custom-types/index';
import { CreateIcon, EnterIcon, InfoIcon } from '@components/icons';
import Loader from '@components/Loader';

interface LobbyActionsProps {
  selectedGameMode: GameMode;
  handleCreateRoom: () => void;
  handleJoinWithCode: (code: string) => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  isProcessing: boolean;
  isConnected: boolean;
  error: string;
  onShowInstructions: () => void;
}

const LobbyActions: React.FC<LobbyActionsProps> = ({
  selectedGameMode,
  handleCreateRoom,
  handleJoinWithCode,
  joinCode,
  setJoinCode,
  isProcessing,
  isConnected,
  error,
  onShowInstructions,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12"
    >
      <div className="bg-surface-100 border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-2xl font-semibold sm:text-3xl mb-4 flex items-center text-text-primary">
          <CreateIcon className="w-8 h-8 mr-4 text-accent" />
          Create Room
        </h2>
        <p className="text-text-secondary mb-8 leading-relaxed text-base sm:text-lg">
          Start a new game of <span className="font-bold text-text-primary">{selectedGameMode}</span> and invite friends.
        </p>
        <div className="flex gap-4">
          <motion.button
            onClick={handleCreateRoom}
            disabled={isProcessing || !isConnected}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-grow bg-accent text-text-on-primary py-3 sm:py-4 px-6 rounded-xl shadow-lg hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? <Loader className="w-5 h-5 text-text-on-primary" /> : "Create Room"}
          </motion.button>
          <motion.button
            onClick={onShowInstructions}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-surface-100 hover:bg-surface-200 border border-primary text-text-secondary hover:text-text-primary font-bold p-3 sm:p-4 rounded-xl transition-all duration-200"
            aria-label="How to Play"
          >
            <InfoIcon className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      <div className="bg-surface-100 border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-2xl font-semibold sm:text-3xl mb-4 flex items-center text-text-primary">
          <EnterIcon className="w-8 h-8 mr-4 text-primary" />
          Join Room
        </h2>
        <p className="text-text-secondary mb-8 leading-relaxed text-base sm:text-lg">Enter a room code to join an existing game.</p>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoinWithCode(joinCode)}
              className="flex-grow px-4 py-3 sm:py-4 bg-surface-200 border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-all duration-200 uppercase font-mono text-lg"
              placeholder="ROOM CODE"
              maxLength={6}
              disabled={!isConnected}
            />
            <motion.button
              onClick={() => handleJoinWithCode(joinCode)}
              disabled={!joinCode || isProcessing || !isConnected}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary text-text-on-primary py-3 sm:py-4 px-8 rounded-xl shadow-lg hover:bg-primary-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
            >
              {isProcessing ? <Loader className="w-5 h-5 text-text-on-primary" /> : "Join"}
            </motion.button>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-error text-sm font-medium"
            >
              {error}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LobbyActions;
