import React from 'react';
import type { Room, Player } from '@custom-types/index';
import { GameMode } from '@custom-types/index';
import InfectionAbilityButton from '@components/GameUI/InfectionAbilityButton';
import HideAndSeekUI from '@components/GameUI/HideAndSeekUI';
import HeistPanicUI from '@components/GameUI/HeistPanicUI';

interface MobileActionButtonsProps {
  room: Room;
  user: Omit<Player, "socketId">;
  isMobile: boolean;
  isFullscreen: boolean;
  activePadId: string | null;
  onAction: () => void;
}

const MobileActionButtons: React.FC<MobileActionButtonsProps> = ({ room, user, isMobile, isFullscreen, activePadId, onAction }) => {
  if (!isMobile || !isFullscreen || room.gameState.status !== "playing") {
    return null;
  }

  const buttonWrapperClass = "absolute bottom-4 right-4 z-50";

  if (room.gameMode === GameMode.INFECTION_ARENA) {
    return (
      <div className={`${buttonWrapperClass} w-32`}>
        <InfectionAbilityButton room={room} user={user} onAction={onAction} />
      </div>
    );
  }
  if (room.gameMode === GameMode.HIDE_AND_SEEK) {
    return (
      <div className={`${buttonWrapperClass} w-40`}>
        <HideAndSeekUI room={room} user={user} onAction={onAction} />
      </div>
    );
  }
  if (room.gameMode === GameMode.HEIST_PANIC && activePadId) {
    return (
      <div className={`${buttonWrapperClass} w-48`}>
        <HeistPanicUI room={room} user={user} onGuessSubmit={onAction} />
      </div>
    );
  }
  return null;
};

export default MobileActionButtons;