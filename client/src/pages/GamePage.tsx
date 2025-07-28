
import React, { useState, useEffect, useRef, TouchEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GameMode, MazeRaceDifficulty } from "../types/index";
import { socketService } from "@services/socketService";
import { usePlayerMovement } from "@hooks/usePlayerMovement";
import { useFullscreen } from "@hooks/useFullscreen";
import { useClipboard } from "@utils/clipboard";
import EndScreen from "@components/EndScreen";
import InstructionsModal from "@components/InstructionsModal";
import { useGame } from "@contexts/GameContext";
import { useDeviceDetection } from "@hooks/useDeviceDetection";
import ConnectionBanner from "@components/ui/ConnectionBanner";
import GameArea from "../components/game/GameArea";
import GameSidebar from "../components/game/GameSidebar";

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

  const getTransformedDirection = (direction: string, rotation: number): string => {
    if (rotation === 0) return direction;
    const directions = ['up', 'right', 'down', 'left'];
    const originalIndex = directions.indexOf(direction);
    if (originalIndex === -1) return direction;
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

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (joystickState.isActive) return;
    const touch = e.changedTouches[0];
    if (!touch || (e.target as HTMLElement).closest('button, input, select')) return;
    e.preventDefault();
    setJoystickState({
      isActive: true,
      position: { x: touch.clientX, y: touch.clientY },
      thumbPosition: { x: 0, y: 0 },
      touchId: touch.identifier,
    });
  };

  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (!joystickState.isActive) return;
    const touch = Array.from(e.changedTouches).find((t) => t.identifier === joystickState.touchId);
    if (!touch) return;
  
    e.preventDefault();
  
    const { x: centerX, y: centerY } = joystickState.position;
    
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
  
    const radius = 40;
    let thumbDx = dx;
    let thumbDy = dy;
  
    if (dist > radius) {
      thumbDx = (dx / dist) * radius;
      thumbDy = (dy / dist) * radius;
    }
  
    setJoystickState(prev => ({ ...prev, thumbPosition: { x: thumbDx, y: thumbDy } }));
  
    const angle = Math.atan2(dy, dx);
    const deadzone = 10;
    let dir = dist < deadzone ? null : (angle > -Math.PI / 4 && angle <= Math.PI / 4) ? "right" : (angle > Math.PI / 4 && angle <= 3 * Math.PI / 4) ? "down" : (angle > 3 * Math.PI / 4 || angle <= -3 * Math.PI / 4) ? "left" : "up";
  
    if (dir) {
      handleMove(dir);
    } else {
      handleMoveEnd();
    }
  }, [joystickState.isActive, joystickState.touchId, joystickState.position, handleMove, handleMoveEnd]);

  const handleTouchEnd = useCallback((e: globalThis.TouchEvent) => {
    if (Array.from(e.changedTouches).some((t) => t.identifier === joystickState.touchId)) {
      handleMoveEnd();
      setJoystickState({ isActive: false, position: { x: 0, y: 0 }, thumbPosition: { x: 0, y: 0 }, touchId: null });
    }
  }, [joystickState.touchId, handleMoveEnd]);

  useEffect(() => {
    if (!joystickState.isActive) return;
  
    const options = { passive: false };
    window.addEventListener('touchmove', handleTouchMove, options);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [joystickState.isActive, handleTouchMove, handleTouchEnd]);


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
    }, 8000);
    return () => clearInterval(rotationInterval);
  }, [room?.gameMode, room?.gameState.status, room?.gameState.maze?.difficulty, clientRotation]);

  const touchHandler = (e: TouchEvent<HTMLDivElement>) => {
    if (isMobile && room?.gameState.status === "playing") {
      handleTouchStart(e);
    }
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
  const handleDifficultyChange = (value: string) => {
    socketService.setMazeRaceDifficulty(room.id, user.id, value as MazeRaceDifficulty)
  };

  if (room.gameState.status === "finished") return <EndScreen room={room} onBackToLobby={handleEndGame} />;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <ConnectionBanner
        isVisible={!isConnected && !isConnectionWarningDismissed}
        error={connectionError}
        onDismiss={dismissConnectionWarning}
      />
      {isInstructionsVisible && <InstructionsModal gameMode={room.gameMode} onClose={() => setIsInstructionsVisible(false)} />}
      <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
        <GameArea
          room={room}
          user={user}
          heistPadFeedback={heistPadFeedback}
          clientRotation={clientRotation}
          isMobile={isMobile}
          isFullscreen={isFullscreen}
          joystickState={joystickState}
          gameAreaRef={gameAreaRef}
          onTouchStart={isMobile && room.gameState.status === "playing" ? touchHandler : undefined}
          enterFullscreen={() => enterFullscreen(gameAreaRef.current!)}
          activePadId={activePadId}
          onGenericAction={handleGenericAction}
        />
        {!isFullscreen && (
          <GameSidebar
            room={room}
            user={user}
            isHost={isHost}
            isMobile={isMobile}
            copied={copied}
            handleCopy={handleCopy}
            setIsInstructionsVisible={setIsInstructionsVisible}
            requestFullscreenOnStart={requestFullscreenOnStart}
            setRequestFullscreenOnStart={setRequestFullscreenOnStart}
            selectedDifficulty={selectedDifficulty}
            handleDifficultyChange={handleDifficultyChange}
            isStartingGame={isStartingGame}
            handleStartGame={handleStartGame}
            handleLeaveRoom={handleLeaveRoom}
            isConnected={isConnected}
            onGenericAction={handleGenericAction}
          />
        )}
      </div>
    </div>
  );
};

export default GamePage;