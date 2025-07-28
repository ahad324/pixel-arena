import React, { TouchEvent } from 'react';
import type { Room, Player } from '@custom-types/index';
import { GameMode } from '@custom-types/index';
import GameBoard from '@components/GameBoard';
import GameStatus from '@components/GameStatus';
import VirtualJoystick from '@components/VirtualJoystick';
import ChatComponent from '@components/ChatComponent';
import { EnterFullscreenIcon } from '@components/icons';
import HidingPhaseIndicator from './HidingPhaseIndicator';
import MobileActionButtons from './MobileActionButton';

interface GameAreaProps {
  room: Room;
  user: Omit<Player, "socketId">;
  heistPadFeedback: { [padId: string]: 'correct' | 'incorrect' };
  clientRotation: number;
  isMobile: boolean;
  isFullscreen: boolean;
  joystickState: { isActive: boolean; position: { x: number; y: number; }; thumbPosition: { x: number; y: number; }; };
  gameAreaRef: React.RefObject<HTMLDivElement>;
  onTouchStart: ((e: TouchEvent<HTMLDivElement>) => void) | undefined;
  enterFullscreen: () => void;
  activePadId: string | null;
  onGenericAction: () => void;
}

const GameArea: React.FC<GameAreaProps> = ({
  room, user, heistPadFeedback, clientRotation, isMobile, isFullscreen,
  joystickState, gameAreaRef, onTouchStart, enterFullscreen, activePadId, onGenericAction
}) => {
  return (
    <div
      ref={gameAreaRef}
      className={isFullscreen ? "fixed inset-0 bg-background flex items-center justify-center z-50 p-2" : "flex-1 flex items-center justify-center relative bg-surface-100/50 border border-border rounded-2xl"}
      onTouchStart={onTouchStart}
    >
      {isFullscreen && <GameStatus room={room} isFullscreen={isFullscreen} />}
      {isFullscreen && room.gameMode === GameMode.HIDE_AND_SEEK && room.gameState.status === 'playing' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <HidingPhaseIndicator room={room} />
        </div>
      )}
      <GameBoard room={room} heistPadFeedback={heistPadFeedback} user={user} clientRotation={clientRotation} />
      {isMobile && room.gameState.status === "playing" && <VirtualJoystick joystickState={joystickState} />}
      <MobileActionButtons
        room={room}
        user={user}
        isMobile={isMobile}
        isFullscreen={isFullscreen}
        activePadId={activePadId}
        onAction={onGenericAction}
      />
      {isMobile && room.gameState.status === "playing" && !isFullscreen &&
        <button onClick={enterFullscreen} className="absolute top-4 right-4 z-10 p-2 bg-surface-200/50 rounded-full" aria-label="Enter fullscreen">
          <EnterFullscreenIcon className="w-6 h-6" />
        </button>
      }
      <ChatComponent />
    </div>
  );
};

export default GameArea;