
import React, { useState, useEffect, useRef, TouchEvent } from "react";
import { useNavigate } from "react-router-dom";
import { GameMode, MazeRaceDifficulty, Room } from "../types/index";
import { socketService } from "@services/socketService";
import { usePlayerMovement } from "@hooks/usePlayerMovement";
import { useFullscreen } from "@hooks/useFullscreen";
import { useClipboard } from "@utils/clipboard";
import GameBoard from "@components/GameBoard";
import EndScreen from "@components/EndScreen";
import InstructionsModal from "@components/InstructionsModal";
import GameStatus from "@components/GameStatus";
import PlayerList from "@components/PlayerList";
import GameControls from "@components/GameControls";
import { GAME_DESCRIPTIONS } from "@constants/index";
import { useGame } from "@contexts/GameContext";
import { useDeviceDetection } from "@hooks/useDeviceDetection";
import VirtualJoystick from "@components/VirtualJoystick";
import SpyDecodeUI from "@components/GameUI/SpyDecodeUI";
import InfectionAbilityButton from "@components/GameUI/InfectionAbilityButton";
import HeistPanicUI from "@components/GameUI/HeistPanicUI";
import HideAndSeekUI from "@components/GameUI/HideAndSeekUI";
import { EnterFullscreenIcon, InfoIcon, CheckCircleIcon, TargetIcon } from "@components/icons";
import ReactionsComponent from "@components/ReactionsComponent";
import ConnectionBanner from "@components/ui/ConnectionBanner";
import Dropdown from "@components/ui/Dropdown";

const HidingPhaseIndicator: React.FC<{ room: Room }> = ({ room }) => {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!room.gameState.seekerFreezeUntil) return;
    const calculateCountdown = () => {
      const remaining = room.gameState.seekerFreezeUntil! - Date.now();
      setCountdown(remaining > 0 ? Math.ceil(remaining / 1000) : 0);
    };
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 500);
    return () => clearInterval(interval);
  }, [room.gameState.seekerFreezeUntil]);

  if (countdown <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-primary/20 to-accent-secondary/20 backdrop-blur-sm border border-primary/30 rounded-xl p-4 mb-4 text-center">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <p className="font-bold text-primary">Hiders are hiding!</p>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      </div>
      <p className="text-sm text-text-secondary">Seekers unfreeze in {countdown}s</p>
    </div>
  );
};

const GamePage: React.FC = () => {
  const { user, room, leaveRoom, endGame, heistPadFeedback, isConnected, connectionError, isConnectionWarningDismissed, dismissConnectionWarning, resetConnectionWarning } = useGame();
  const { isMobile } = useDeviceDetection();
  const navigate = useNavigate();
  const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);
  const [requestFullscreenOnStart, setRequestFullscreenOnStart] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<MazeRaceDifficulty>(MazeRaceDifficulty.EASY);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  const { copied, handleCopy } = useClipboard(room?.id || "");
  const [activePadId, setActivePadId] = useState<string | null>(null);
  const [clientRotation, setClientRotation] = useState(0);

  // Corrects the player's directional input based on the maze's rotation
  const getTransformedDirection = (direction: string, rotation: number): string => {
    if (rotation === 0) return direction;
    const directions = ['up', 'right', 'down', 'left'];
    const originalIndex = directions.indexOf(direction);
    if (originalIndex === -1) return direction;
    // We rotate the input in the opposite direction of the maze's clockwise rotation
    const rotationSteps = (rotation / 90) % 4;
    const transformedIndex = (originalIndex - rotationSteps + 4) % 4;
    return directions[transformedIndex];
  };

  const { handleAction, handleMove: originalHandleMove, handleMoveEnd } = usePlayerMovement(user!, room!, isMobile);
  const handleMove = (direction: string) => {
    const transformedDirection = getTransformedDirection(direction, clientRotation);
    originalHandleMove(transformedDirection);
  };

  const handleGenericAction = () => { if (user && room) handleAction(); };

  useEffect(() => {
    socketService.onPlayerOnPad(data => { if (data.playerId === user?.id) setActivePadId(data.padId); });
    socketService.onPlayerOffPad(data => { if (data.playerId === user?.id) setActivePadId(null); });
    return () => { socketService.offPlayerOnPad(); socketService.offPlayerOffPad(); };
  }, [user?.id]);

  const [joystickState, setJoystickState] = useState({
    isActive: false, position: { x: 0, y: 0 }, thumbPosition: { x: 0, y: 0 }, touchId: null as number | null,
  });

  useEffect(() => {
    if (room?.gameState.status === "playing" && !isFullscreen && gameAreaRef.current && (isMobile || requestFullscreenOnStart)) {
      enterFullscreen(gameAreaRef.current);
    }
    if (room?.gameState.status !== "playing" && isFullscreen) exitFullscreen();
  }, [room?.gameState.status, isMobile, isFullscreen, enterFullscreen, exitFullscreen, requestFullscreenOnStart]);

  useEffect(() => {
    if (room?.gameState.status !== "waiting" || !isConnected) {
      setIsStartingGame(false);
    }
  }, [room?.gameState.status, isConnected]);

  useEffect(() => { if (room?.mazeRaceSettings?.difficulty) setSelectedDifficulty(room.mazeRaceSettings.difficulty) }, [room?.mazeRaceSettings?.difficulty]);

  useEffect(() => {
    socketService.onMazeDifficultyChanged(data => setSelectedDifficulty(data.difficulty));
    return () => socketService.offMazeDifficultyChanged();
  }, []);

  useEffect(() => {
    if (room?.gameMode !== GameMode.MAZE_RACE || room?.gameState.status !== "playing") {
      if (clientRotation !== 0) setClientRotation(0);
      return;
    }
    const difficulty = room.gameState.maze?.difficulty;
    const shouldRotate = difficulty === "hard" || difficulty === "expert";
    if (!shouldRotate) {
      if (clientRotation !== 0) setClientRotation(0);
      return;
    }
    const rotationInterval = setInterval(() => {
      setClientRotation((prev) => (prev + 90) % 360);
    }, 12000);
    return () => clearInterval(rotationInterval);
  }, [room?.gameMode, room?.gameState.status, room?.gameState.maze?.difficulty, clientRotation]);


  const touchHandler = (handler: (e: TouchEvent<HTMLDivElement>) => void) => isMobile && room?.gameState.status === "playing" ? handler : undefined;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (joystickState.isActive) return;
    const touch = e.changedTouches[0];
    if (!touch || (e.target as HTMLElement).closest('button, input, select')) return;
    e.preventDefault();
    setJoystickState({ isActive: true, position: { x: touch.clientX, y: touch.clientY }, thumbPosition: { x: 0, y: 0 }, touchId: touch.identifier });
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const touch = Array.from(e.changedTouches).find((t) => t.identifier === joystickState.touchId);
    if (!touch || !joystickState.isActive) return;
    e.preventDefault();
    const { x: centerX, y: centerY } = joystickState.position;
    let dx = touch.clientX - centerX, dy = touch.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 20;
    if (dist > radius) { dx = (dx / dist) * radius; dy = (dy / dist) * radius; }
    setJoystickState(prev => ({ ...prev, thumbPosition: { x: dx, y: dy } }));
    const angle = Math.atan2(dy, dx);
    let dir = dist < 10 ? null : (angle > -Math.PI / 4 && angle <= Math.PI / 4) ? "right" : (angle > Math.PI / 4 && angle <= 3 * Math.PI / 4) ? "down" : (angle > 3 * Math.PI / 4 || angle <= -3 * Math.PI / 4) ? "left" : "up";
    if (dir) handleMove(dir); else handleMoveEnd();
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!Array.from(e.changedTouches).some((t) => t.identifier === joystickState.touchId)) return;
    e.preventDefault();
    handleMoveEnd();
    setJoystickState({ isActive: false, position: { x: 0, y: 0 }, thumbPosition: { x: 0, y: 0 }, touchId: null });
  };

  if (!user || !room) return null;
  const isHost = room.hostId === user.id;

  const checkConnection = () => {
    if (!isConnected) {
      resetConnectionWarning();
      return false;
    }
    return true;
  };

  const handleStartGame = () => {
    if (!checkConnection() || isStartingGame) return;
    setIsStartingGame(true);
    socketService.startGame(room.id, user.id);
  };
  const handleLeaveRoom = () => { leaveRoom(); navigate("/lobby"); };
  const handleEndGame = () => { endGame(); navigate("/lobby"); };

  if (room.gameState.status === "finished") return <EndScreen room={room} onBackToLobby={handleEndGame} />;

  const renderMobileActionButtons = () => {
    if (!isMobile || !isFullscreen || room.gameState.status !== "playing") return null;
    const buttonWrapperClass = "absolute bottom-4 right-4 z-50";
    if (room.gameMode === GameMode.INFECTION_ARENA) return <div className={`${buttonWrapperClass} w-32`}><InfectionAbilityButton room={room} user={user} onAction={handleGenericAction} /></div>;
    if (room.gameMode === GameMode.HIDE_AND_SEEK) return <div className={`${buttonWrapperClass} w-40`}><HideAndSeekUI room={room} user={user} onAction={handleGenericAction} /></div>;
    if (room.gameMode === GameMode.HEIST_PANIC && activePadId) return <div className={`${buttonWrapperClass} w-48`}><HeistPanicUI room={room} user={user} onGuessSubmit={handleGenericAction} /></div>;
    return null;
  };

  const difficultyOptions = (['easy', 'medium', 'hard', 'expert'] as const).map(d => ({
    value: d,
    label: d.charAt(0).toUpperCase() + d.slice(1),
  }));

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <ConnectionBanner
        isVisible={!isConnected && !isConnectionWarningDismissed}
        error={connectionError}
        onDismiss={dismissConnectionWarning}
      />
      {isInstructionsVisible && <InstructionsModal gameMode={room.gameMode} onClose={() => setIsInstructionsVisible(false)} />}
      <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
        <div ref={gameAreaRef} className={isFullscreen ? "fixed inset-0 bg-background flex items-center justify-center z-50 p-2" : "flex-1 flex items-center justify-center relative bg-surface-100/50 border border-border rounded-2xl"} onTouchStart={touchHandler(handleTouchStart)} onTouchMove={touchHandler(handleTouchMove)} onTouchEnd={touchHandler(handleTouchEnd)} onTouchCancel={touchHandler(handleTouchEnd)}>
          {isFullscreen && <GameStatus room={room} isFullscreen={isFullscreen} />}
          {isFullscreen && room.gameMode === GameMode.HIDE_AND_SEEK && room.gameState.status === 'playing' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <HidingPhaseIndicator room={room} />
            </div>
          )}
          <GameBoard room={room} heistPadFeedback={heistPadFeedback} user={user} clientRotation={clientRotation} />
          {isMobile && room.gameState.status === "playing" && <VirtualJoystick joystickState={joystickState} />}
          {renderMobileActionButtons()}
          {isMobile && room.gameState.status === "playing" && !isFullscreen && <button onClick={() => enterFullscreen(gameAreaRef.current!)} className="absolute top-4 right-4 z-10 p-2 bg-surface-200/50 rounded-full" aria-label="Enter fullscreen"><EnterFullscreenIcon className="w-6 h-6" /></button>}
          <ReactionsComponent />
        </div>
        {!isFullscreen && (
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
              <button onClick={() => setIsInstructionsVisible(true)} className="p-2 bg-surface-200/50 hover:bg-surface-200/80 rounded-xl text-text-secondary hover:text-text-primary transition-colors border border-border"><InfoIcon className="w-5 h-5" /></button>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-4 bg-surface-200/30 rounded-xl p-4 border border-border/50">{GAME_DESCRIPTIONS[room.gameMode]}</p>
            {room.gameMode === GameMode.SPY_AND_DECODE && <SpyDecodeUI room={room} user={user} />}
            {room.gameMode === GameMode.HIDE_AND_SEEK && room.gameState.status === "playing" && <HidingPhaseIndicator room={room} />}
            <div className="mb-4"><GameStatus room={room} isFullscreen={isFullscreen} /></div>
            <div className="flex-grow min-h-0 mb-4"><PlayerList room={room} user={user} /></div>
            {!isMobile && room.gameState.status === "waiting" && <label className="flex items-center justify-center cursor-pointer mb-4"><input type="checkbox" checked={requestFullscreenOnStart} onChange={e => setRequestFullscreenOnStart(e.target.checked)} className="w-4 h-4 text-primary bg-surface-200 border-border rounded focus:ring-primary focus:ring-2" /><span className="ml-2 text-sm text-text-secondary">Play in Fullscreen</span></label>}
            {room.gameMode === GameMode.MAZE_RACE && room.gameState.status === "waiting" && isHost && (
              <div className="mb-4">
                <Dropdown
                  label="Maze Difficulty"
                  options={difficultyOptions}
                  selectedValue={selectedDifficulty}
                  onChange={(value) => socketService.setMazeRaceDifficulty(room.id, user.id, value as MazeRaceDifficulty)}
                  disabled={!isConnected}
                />
              </div>
            )}
            <div className="space-y-2 mt-auto">
              {room.gameState.status === 'playing' && !isMobile && room.gameMode === GameMode.INFECTION_ARENA && <InfectionAbilityButton room={room} user={user} onAction={handleGenericAction} />}
              {room.gameState.status === 'playing' && !isMobile && room.gameMode === GameMode.HEIST_PANIC && <HeistPanicUI room={room} user={user} onGuessSubmit={handleGenericAction} />}
              {room.gameState.status === 'playing' && !isMobile && room.gameMode === GameMode.HIDE_AND_SEEK && <HideAndSeekUI room={room} user={user} onAction={handleGenericAction} />}
              <GameControls room={room} isHost={isHost} onStartGame={handleStartGame} onLeaveRoom={handleLeaveRoom} isProcessing={isStartingGame || !isConnected} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
