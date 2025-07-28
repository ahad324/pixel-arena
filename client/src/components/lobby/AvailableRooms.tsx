import React from 'react';
import { motion } from 'framer-motion';
import { GameMode } from '@custom-types/index';
import { PLAYER_COLORS } from '@constants/index';
import Loader from '@components/Loader';
import {
  TagIcon, TerritoryIcon, MazeIcon, HeistIcon, InfectionIcon,
  TrapIcon, SpyIcon, HideAndSeekIcon, CreateIcon
} from '@components/icons';

interface AvailableRoomsProps {
  availableRooms: { id: string; gameMode: GameMode; playerCount: number }[];
  isLoadingRooms: boolean;
  isConnected: boolean;
  handleJoinWithCode: (code: string) => void;
  isProcessing: boolean;
}

const gameModeIcons: Record<string, React.ReactNode> = {
    [GameMode.TAG]: <TagIcon className="h-8 w-8" />,
    [GameMode.TERRITORY_CONTROL]: <TerritoryIcon className="h-8 w-8" />,
    [GameMode.MAZE_RACE]: <MazeIcon className="h-8 w-8" />,
    [GameMode.HEIST_PANIC]: <HeistIcon className="h-8 w-8" />,
    [GameMode.INFECTION_ARENA]: <InfectionIcon className="h-8 w-8" />,
    [GameMode.TRAP_RUSH]: <TrapIcon className="h-8 w-8" />,
    [GameMode.SPY_AND_DECODE]: <SpyIcon className="h-8 w-8" />,
    [GameMode.HIDE_AND_SEEK]: <HideAndSeekIcon className="h-8 w-8" />,
};

const AvailableRooms: React.FC<AvailableRoomsProps> = ({
  availableRooms,
  isLoadingRooms,
  isConnected,
  handleJoinWithCode,
  isProcessing,
}) => {
  const renderContent = () => {
    if (isLoadingRooms && isConnected) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader className="w-8 h-8" text="Loading rooms..." containerClassName="flex-col" />
        </div>
      );
    }
    if (!isConnected) {
      return (
        <div className="text-center py-16">
          <div className="text-text-secondary mb-6">
            <p className="text-2xl font-bold mb-2">Connection Error</p>
            <p className="text-lg">Cannot fetch available rooms. Please check your connection.</p>
          </div>
        </div>
      );
    }
    if (availableRooms.length > 0) {
      return availableRooms.map((room, index) => (
        <motion.div
          key={room.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.01, backgroundColor: "hsl(var(--surface-200-hsl))" }}
          className="bg-surface-200 border border-border rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-border/50 transition-all duration-200"
        >
          <div className="flex items-center space-x-4 sm:space-x-6 flex-grow min-w-0">
            <div className="text-primary">{gameModeIcons[room.gameMode]}</div>
            <div className="flex-grow min-w-0">
              <p className="font-bold text-text-primary text-lg sm:text-xl truncate">{room.gameMode}</p>
              <p className="text-sm text-text-secondary">
                Code: <span className="font-mono text-warning font-bold text-base">{room.id}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <div className="text-left sm:text-right flex-grow sm:flex-grow-0">
              <p className="text-text-primary font-bold text-lg">
                {room.playerCount} / {PLAYER_COLORS.length}
              </p>
              <p className="text-xs text-text-secondary uppercase tracking-wider">players</p>
            </div>
            <motion.button
              onClick={() => handleJoinWithCode(room.id)}
              disabled={isProcessing || !isConnected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-text-on-primary py-3 px-6 rounded-xl shadow-lg hover:bg-primary-hover transition-all duration-200 disabled:opacity-50"
            >
              Join
            </motion.button>
          </div>
        </motion.div>
      ));
    }
    return (
      <div className="text-center py-16">
        <div className="text-text-secondary mb-6">
          <CreateIcon className="w-20 h-20 mx-auto mb-6 opacity-30" />
          <p className="text-2xl font-bold mb-2">No rooms available</p>
          <p className="text-lg">Be the first to create one!</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-surface-100 border border-border rounded-3xl p-6 sm:p-8 shadow-2xl"
    >
      <h2 className="text-2xl font-semibold sm:text-3xl mb-8 text-text-primary">Available Rooms</h2>
      <div className="space-y-4 max-h-[40vh] overflow-y-auto scrollbar-thin">
        {renderContent()}
      </div>
    </motion.div>
  );
};

export default AvailableRooms;
