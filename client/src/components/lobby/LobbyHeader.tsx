import React from 'react';
import { motion } from 'framer-motion';
import { GearIcon } from '@components/icons';
import type { Player } from '@custom-types/index';

interface LobbyHeaderProps {
  user: Omit<Player, "socketId"> | null;
  onSettingsClick: () => void;
}

const LobbyHeader: React.FC<LobbyHeaderProps> = ({ user, onSettingsClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8 md:mb-12 relative"
    >
      <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl tracking-tighter mb-4 text-text-primary">GAME LOBBY</h1>
      <p className="text-lg sm:text-xl text-text-secondary">
        Welcome back, <span className="text-text-primary font-bold">{user?.name}</span>
      </p>
      <motion.button
        onClick={onSettingsClick}
        whileHover={{ scale: 1.05, rotate: 15 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-0 right-0 w-10 h-10 sm:w-12 sm:h-12 bg-surface-100 hover:bg-surface-200 border border-primary rounded-xl flex items-center justify-center transition-all duration-300 group"
        aria-label="Settings"
      >
        <GearIcon className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary group-hover:text-primary transition-colors" />
      </motion.button>
    </motion.div>
  );
};

export default LobbyHeader;
