import React from 'react';
import type { Player } from '../types';
import { CELL_SIZE, INFECTED_COLOR } from '@constants/index';
import { FreezeIcon } from '@components/icons';

interface PlayerAvatarProps {
  player: Player;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player }) => {
  if (player.isEliminated) {
    return null;
  }

  const now = Date.now();
  const isShielded = player.shieldUntil && now < player.shieldUntil;
  const itClass = player.isIt ? 'shadow-lg shadow-red-500/80 ring-2 ring-red-400 animate-pulse' : '';
  const shieldClass = isShielded ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-gray-900 animate-pulse' : '';
  
  const isFrozen = player.effects?.some(e => e.type === 'frozen' && e.expires > now);
  const isSlowed = player.effects?.some(e => e.type === 'slow' && e.expires > now);

  return (
    <div
      className="absolute transition-all duration-100 ease-linear"
      style={{
        left: player.x * CELL_SIZE,
        top: player.y * CELL_SIZE,
        width: CELL_SIZE,
        height: CELL_SIZE,
        filter: `drop-shadow(0 2px 4px ${player.isInfected ? INFECTED_COLOR : player.color}99)`,
        transition: isFrozen ? 'none' : 'all 100ms linear',
      }}
    >
      <div
        className={`w-full h-full rounded-md flex items-center justify-center transition-colors ${itClass} ${shieldClass}`}
        style={{ backgroundColor: player.isInfected ? INFECTED_COLOR : player.color, opacity: isSlowed ? 0.7 : 1.0 }}
      >
        {isFrozen && <FreezeIcon className="w-3/4 h-3/4 text-white animate-pulse"/>}
      </div>
       <div className="absolute -top-5 w-full text-center text-xs font-bold whitespace-nowrap" style={{color: player.isInfected ? INFECTED_COLOR : player.color}}>
          {player.name}
      </div>
    </div>
  );
};

export default PlayerAvatar;