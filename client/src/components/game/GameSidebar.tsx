import React from 'react';
import { GameMode } from '@custom-types/index';
import type { MazeRaceDifficulty, Room, Player } from '@custom-types/index';
import { GAME_DESCRIPTIONS } from '@constants/index';
import Dropdown from '@components/ui/Dropdown';
import PlayerList from '@components/PlayerList';
import GameStatus from '@components/GameStatus';
import GameControls from '@components/GameControls';
import SpyDecodeUI from '@components/GameUI/SpyDecodeUI';
import InfectionAbilityButton from '@components/GameUI/InfectionAbilityButton';
import HeistPanicUI from '@components/GameUI/HeistPanicUI';
import HideAndSeekUI from '@components/GameUI/HideAndSeekUI';
import HidingPhaseIndicator from './HidingPhaseIndicator';
import { InfoIcon, CheckCircleIcon, TargetIcon } from '@components/icons';

interface GameSidebarProps {
  room: Room;
  user: Omit<Player, "socketId">;
  isHost: boolean;
  isMobile: boolean;
  copied: boolean;
  handleCopy: () => void;
  setIsInstructionsVisible: (visible: boolean) => void;
  requestFullscreenOnStart: boolean;
  setRequestFullscreenOnStart: (checked: boolean) => void;
  selectedDifficulty: MazeRaceDifficulty;
  handleDifficultyChange: (value: string) => void;
  isStartingGame: boolean;
  handleStartGame: () => void;
  handleLeaveRoom: () => void;
  isConnected: boolean;
  onGenericAction: () => void;
}

const GameSidebar: React.FC<GameSidebarProps> = ({
  room, user, isHost, isMobile, copied, handleCopy, setIsInstructionsVisible,
  requestFullscreenOnStart, setRequestFullscreenOnStart, selectedDifficulty,
  handleDifficultyChange, isStartingGame, handleStartGame, handleLeaveRoom,
  isConnected, onGenericAction
}) => {
  const difficultyOptions = (['easy', 'medium', 'hard', 'expert'] as const).map(d => ({
    value: d,
    label: d.charAt(0).toUpperCase() + d.slice(1),
  }));

  return (
    <div className="lg:w-96 flex-shrink-0 bg-surface-100/50 border border-border rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-secondary rounded-xl flex items-center justify-center"><TargetIcon className="w-5 h-5 text-text-on-primary" /></div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{room.gameMode}</h2>
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <span>Room:</span>
              <button onClick={handleCopy} className="flex items-center gap-1 hover:text-text-primary transition-colors font-mono"><span className="text-primary font-bold">{room.id}</span>{copied && <CheckCircleIcon className="w-4 h-4 text-accent" />}</button>
            </div>
          </div>
        </div>
        <button onClick={() => setIsInstructionsVisible(true)} className="p-2 bg-surface-200/50 hover:bg-surface-200/80 rounded-xl text-text-secondary hover:text-text-primary transition-colors border border-primary"><InfoIcon className="w-5 h-5" /></button>
      </div>
      <p className="text-text-secondary text-sm leading-relaxed mb-4 bg-surface-200/30 rounded-xl p-4 border border-border/50">{GAME_DESCRIPTIONS[room.gameMode]}</p>
      {room.gameMode === GameMode.SPY_AND_DECODE && <SpyDecodeUI room={room} user={user} />}
      {room.gameMode === GameMode.HIDE_AND_SEEK && room.gameState.status === "playing" && <HidingPhaseIndicator room={room} />}
      <div className="mb-4"><GameStatus room={room} isFullscreen={false} /></div>
      <div className="flex-grow min-h-0 mb-4"><PlayerList room={room} user={user} /></div>
      {!isMobile && room.gameState.status === "waiting" && <label className="flex items-center justify-center cursor-pointer mb-4"><input type="checkbox" checked={requestFullscreenOnStart} onChange={e => setRequestFullscreenOnStart(e.target.checked)} className="w-4 h-4 text-primary bg-surface-200 border-border rounded focus:ring-primary focus:ring-2" /><span className="ml-2 text-sm text-text-secondary">Play in Fullscreen</span></label>}
      {room.gameMode === GameMode.MAZE_RACE && room.gameState.status === "waiting" && isHost && (
        <div className="mb-4">
          <Dropdown
            label="Maze Difficulty"
            options={difficultyOptions}
            selectedValue={selectedDifficulty}
            onChange={handleDifficultyChange}
            disabled={!isConnected}
          />
        </div>
      )}
      <div className="space-y-2 mt-auto">
        {room.gameState.status === 'playing' && !isMobile && room.gameMode === GameMode.INFECTION_ARENA && <InfectionAbilityButton room={room} user={user} onAction={onGenericAction} />}
        {room.gameState.status === 'playing' && !isMobile && room.gameMode === GameMode.HEIST_PANIC && <HeistPanicUI room={room} user={user} onGuessSubmit={onGenericAction} />}
        {room.gameState.status === 'playing' && !isMobile && room.gameMode === GameMode.HIDE_AND_SEEK && <HideAndSeekUI room={room} user={user} onAction={onGenericAction} />}
        <GameControls room={room} isHost={isHost} onStartGame={handleStartGame} onLeaveRoom={handleLeaveRoom} isProcessing={isStartingGame || !isConnected} />
      </div>
    </div>
  );
}

export default GameSidebar;