import React from 'react';
import { motion } from 'framer-motion';
import { GameMode } from '@custom-types/index';
import { getGameModeStatus } from '@constants/index';
import GameModeCard from '@components/GameModeCard';
import {
  TagIcon,
  TerritoryIcon,
  MazeIcon,
  HeistIcon,
  InfectionIcon,
  TrapIcon,
  SpyIcon,
  HideAndSeekIcon,
} from '@components/icons';

interface GameModeSelectorProps {
  selectedGameMode: GameMode;
  onSelect: (mode: GameMode) => void;
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

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ selectedGameMode, onSelect }) => {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-semibold sm:text-3xl mb-6 text-text-primary text-center md:text-left"
      >
        Select a Game Mode
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-12"
      >
        {(Object.values(GameMode) as GameMode[]).map((mode, index) => {
          const status = getGameModeStatus(mode);
          return (
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GameModeCard
                mode={mode}
                icon={gameModeIcons[mode]}
                selected={selectedGameMode === mode}
                onSelect={() => onSelect(mode)}
                status={status}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
};

export default GameModeSelector;
