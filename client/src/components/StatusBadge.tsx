
import React from 'react';
import { GameStatus, STATUS_CONFIG } from '@constants/index';
import {
  StatusNewIcon,
  StatusBetaIcon,
  StatusPopularIcon,
  StatusUpdatedIcon,
  StatusFeaturedIcon,
  StatusExperimentalIcon,
  StatusComingSoonIcon,
  StatusLimitedTimeIcon,
} from '@components/icons';

interface StatusBadgeProps {
  status: GameStatus;
  className?: string;
}

const iconMap = {
  StatusNewIcon,
  StatusBetaIcon,
  StatusPopularIcon,
  StatusUpdatedIcon,
  StatusFeaturedIcon,
  StatusExperimentalIcon,
  StatusComingSoonIcon,
  StatusLimitedTimeIcon,
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status];
  const IconComponent = iconMap[config.iconName as keyof typeof iconMap];

  if (!IconComponent) {
    return null;
  }

  return (
    <div
      className={`absolute top-2 right-2 group ${className}`}
      aria-label={`${config.label} status`}
      role="status"
    >
      <div className="relative animate-scale-in">
        {/* Glow effect for high priority statuses */}
        {config.priority >= 7 && (
          <div className={`absolute inset-0 ${config.bgColor} rounded-full blur-sm opacity-60 animate-pulse`} />
        )}
        
        {/* The icon badge */}
        <div
          className={`relative w-6 h-6 ${config.bgColor} rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer ${config.animation}`}
        >
          <IconComponent 
            className={`w-full h-full ${config.color} drop-shadow-sm`}
            aria-hidden="true"
          />
        </div>

        {/* Modern tooltip */}
        <div className="absolute top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="bg-surface-200 text-text-primary text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-border">
            {config.label}
            {/* Tooltip arrow */}
            <div className="absolute -top-1 right-2 w-2 h-2 bg-surface-200 border-l border-t border-border transform rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBadge;
export { StatusBadge };
