import React, { useState, useEffect, useRef, TouchEvent } from "react";
import { GameMode, MazeRaceDifficulty, Room } from "../types/index";
import { socketService } from "@services/socketService";
import { usePlayerMovement } from "@hooks/usePlayerMovement";
import { useFullscreen } from "@hooks/useFullscreen";
import { useClipboard } from "@utils/clipboard";
import GameBoard from "@components/GameBoard";
import EndScreen from "@components/EndScreen";
import InstructionsModal from "@components/InstructionsModal";
import LoadingScreen from "@components/LoadingScreen";
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
import { EnterFullscreenIcon, InfoIcon, CheckCircleIcon } from "@components/icons";
import ReactionsComponent from "@components/ReactionsComponent";

const HidingPhaseIndicator: React.FC<{ room: Room }> = ({ room }) => {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!room.gameState.seekerFreezeUntil) return;

    const calculateCountdown = () => {
      const remaining = room.gameState.seekerFreezeUntil! - Date.now();
      if (remaining > 0) {
        setCountdown(Math.ceil(remaining / 1000));
      } else {
        setCountdown(0);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 500);

    return () => clearInterval(interval);
  }, [room.gameState.seekerFreezeUntil]);

  if (countdown <= 0) return null;

  return (
    <div className="bg-surface-200 border-2 border-primary/50 rounded-lg p-3 mb-4 text-center animate-pulse">
      <p className="font-bold text-primary">Hiders are hiding!</p>
      <p className="text-sm text-text-secondary">Seekers unfreeze in {countdown}s</p>
    </div>
  );
};


const GamePage: React.FC = () => {
  const { user, room, leaveRoom, endGame, heistPadFeedback } = useGame();
  const { isMobile } = useDeviceDetection();
  const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);
  const [requestFullscreenOnStart, setRequestFullscreenOnStart] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(MazeRaceDifficulty.EASY);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  const { copied, handleCopy } = useClipboard(room?.id || "");
  const [activePadId, setActivePadId] = useState<string | null>(null);
  const { handleAction, handleMove, handleMoveEnd } = usePlayerMovement(user!, room!, isMobile);

  const handleGenericAction = () => {
    if (user && room) {
      handleAction();
    }
  };

  useEffect(() => {
    const handlePlayerOnPad = (data: { playerId: string; padId: string }) => {
      if (data.playerId === user?.id) {
        setActivePadId(data.padId);
      }
    };

    const handlePlayerOffPad = (data: { playerId: string }) => {
      if (data.playerId === user?.id) {
        setActivePadId(null);
      }
    };

    socketService.onPlayerOnPad(handlePlayerOnPad);
    socketService.onPlayerOffPad(handlePlayerOffPad);

    return () => {
      socketService.offPlayerOnPad();
      socketService.offPlayerOffPad();
    };
  }, [user?.id]);

  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const [joystickState, setJoystickState] = useState({
    isActive: false,
    position: { x: 0, y: 0 },
    thumbPosition: { x: 0, y: 0 },
    touchId: null as number | null,
  });

  useEffect(() => {
    if (
      room?.gameState.status === "playing" &&
      !isFullscreen &&
      gameAreaRef.current
    ) {
      if (isMobile || requestFullscreenOnStart) {
        enterFullscreen(gameAreaRef.current);
      }
    }
  }, [
    room?.gameState.status,
    isMobile,
    isFullscreen,
    enterFullscreen,
    requestFullscreenOnStart,
  ]);

  useEffect(() => {
    if (room?.gameState.status !== "playing" && isFullscreen) {
      exitFullscreen();
    }
    if (
      room?.gameMode === GameMode.SPY_AND_DECODE &&
      room?.gameState.phase === "guessing" &&
      isFullscreen
    ) {
      exitFullscreen();
    }
  }, [room?.gameState, isFullscreen, exitFullscreen, room?.gameMode]);

  useEffect(() => {
    if (room?.mazeRaceSettings?.difficulty) {
      setSelectedDifficulty(room.mazeRaceSettings.difficulty);
    }
  }, [room?.mazeRaceSettings?.difficulty]);

  useEffect(() => {
    const handleDifficultyChange = (data: {
      difficulty: MazeRaceDifficulty;
      room: Room;
    }) => {
      setSelectedDifficulty(data.difficulty);
    };

    socketService.onMazeDifficultyChanged(handleDifficultyChange);
    return () => socketService.offMazeDifficultyChanged();
  }, []);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (joystickState.isActive) return;
    const touch = e.changedTouches[0] as Touch;
    if (!touch) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select')) return;
    e.preventDefault(); // Prevent window scrolling
    setJoystickState({
      isActive: true,
      position: { x: touch.clientX, y: touch.clientY },
      thumbPosition: { x: 0, y: 0 },
      touchId: touch.identifier,
    });
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!joystickState.isActive) return;
    const touch = Array.from(e.changedTouches).find(
      (t: any) => t.identifier === joystickState.touchId
    );
    if (!touch) return;
    e.preventDefault(); // Prevent window scrolling
    const { x: centerX, y: centerY } = joystickState.position;
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const JOYSTICK_SIZE = 80;
    const THUMB_SIZE = 40;
    const radius = (JOYSTICK_SIZE - THUMB_SIZE) / 2;

    let thumbX = dx;
    let thumbY = dy;

    if (distance > radius) {
      thumbX = (dx / distance) * radius;
      thumbY = (dy / distance) * radius;
    }

    setJoystickState((prev) => ({
      ...prev,
      thumbPosition: { x: thumbX, y: thumbY },
    }));

    if (distance < radius / 3) {
      handleMoveEnd();
      return;
    }

    const angle = Math.atan2(dy, dx);
    let direction: string;
    if (angle > -Math.PI / 4 && angle <= Math.PI / 4) direction = "right";
    else if (angle > Math.PI / 4 && angle <= (3 * Math.PI) / 4)
      direction = "down";
    else if (angle > (3 * Math.PI) / 4 || angle <= (-3 * Math.PI) / 4)
      direction = "left";
    else direction = "up";

    handleMove(direction);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const touch = Array.from(e.changedTouches).find(
      (t: any) => t.identifier === joystickState.touchId
    );
    if (!touch) return;
    e.preventDefault(); // Prevent window scrolling
    handleMoveEnd();
    setJoystickState({
      isActive: false,
      position: { x: 0, y: 0 },
      thumbPosition: { x: 0, y: 0 },
      touchId: null,
    });
  };

  const handleTouchCancel = (e: TouchEvent<HTMLDivElement>) => {
    const touch = Array.from(e.changedTouches).find(
      (t: any) => t.identifier === joystickState.touchId
    );
    if (!touch) return;
    e.preventDefault(); // Prevent window scrolling
    handleMoveEnd();
    setJoystickState({
      isActive: false,
      position: { x: 0, y: 0 },
      thumbPosition: { x: 0, y: 0 },
      touchId: null,
    });
  };

  if (!user || !room) {
    return <LoadingScreen />;
  }

  const handleStartGame = () => {
    socketService.startGame(room.id, user.id);
  };

  const handleReEnterFullscreen = () => {
    if (gameAreaRef.current) {
      enterFullscreen(gameAreaRef.current);
    }
  };

  const isHost = room.hostId === user.id;

  if (room.gameState.status === "finished") {
    return <EndScreen room={room} onBackToLobby={endGame} />;
  }

  const renderMobileActionButtons = () => {
    if (!isMobile || !isFullscreen || room.gameState.status !== "playing") return null;

    if (room.gameMode === GameMode.INFECTION_ARENA) {
      return (
        <div className="absolute bottom-4 right-4 w-24 h-24 z-60">
          <InfectionAbilityButton room={room} user={user} onAction={handleGenericAction} />
        </div>
      );
    }

    if (room.gameMode === GameMode.HIDE_AND_SEEK) {
      return (
        <div className="absolute bottom-4 right-4 w-40 z-60">
          <HideAndSeekUI room={room} user={user} onAction={handleGenericAction} />
        </div>
      );
    }

    if (room.gameMode === GameMode.HEIST_PANIC && activePadId) {
      return (
        <div className="absolute bottom-4 right-4 w-48 z-60">
          <HeistPanicUI room={room} user={user} onGuessSubmit={handleGenericAction} />
        </div>
      );
    }

    return null;
  }

  return (
    <>
      {isInstructionsVisible && (
        <InstructionsModal
          gameMode={room.gameMode}
          onClose={() => setIsInstructionsVisible(false)}
        />
      )}
      <div className="w-full flex flex-col lg:flex-row gap-6">
        <div
          ref={gameAreaRef}
          className={
            isFullscreen
              ? "fixed inset-0 bg-background flex items-center justify-center z-50 p-2"
              : "flex-grow flex items-center justify-center relative min-h-[300px] lg:min-h-0"
          }
          onTouchStart={
            isMobile && room.gameState.status === "playing"
              ? handleTouchStart
              : undefined
          }
          onTouchMove={
            isMobile && room.gameState.status === "playing"
              ? handleTouchMove
              : undefined
          }
          onTouchEnd={
            isMobile && room.gameState.status === "playing"
              ? handleTouchEnd
              : undefined
          }
          onTouchCancel={
            isMobile && room.gameState.status === "playing"
              ? handleTouchCancel
              : undefined
          }
        >
          {isFullscreen && (
            <GameStatus room={room} isFullscreen={isFullscreen} />
          )}
          <GameBoard
            room={room}
            heistPadFeedback={heistPadFeedback}
            user={user}
          />
          {isMobile && room.gameState.status === "playing" && (
            <VirtualJoystick joystickState={joystickState} />
          )}
          {renderMobileActionButtons()}
          {isMobile &&
            room.gameState.status === "playing" &&
            !isFullscreen && (
              <button
                onClick={handleReEnterFullscreen}
                className="absolute top-4 right-4 z-60 p-2 bg-black/30 rounded-full text-text-primary hover:bg-black/50 transition-colors animate-pulse"
                aria-label="Enter fullscreen"
              >
                <EnterFullscreenIcon className="w-8 h-8" />
              </button>
            )}
        </div>
        {!isFullscreen && (
          <div className="lg:w-80 flex-shrink-0 bg-surface-100 border border-border rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-2xl font-bold text-text-primary">{room.gameMode}</h2>
              <button
                onClick={() => setIsInstructionsVisible(true)}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="How to Play"
              >
                {room.gameState.status === "waiting" && (
                  <span className="text-sm font-semibold">How to play</span>
                )}
                <InfoIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center mb-2">
              <p className="text-sm text-text-secondary">
                Room Code:{" "}
                <span
                  className="font-bold text-warning tracking-widest cursor-pointer"
                  onClick={handleCopy}
                >
                  {room.id}
                </span>
              </p>
              {copied && (
                <div className="ml-2 flex items-center text-accent text-xs animate-in fade-in">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  <span>Copied!</span>
                </div>
              )}
            </div>
            <p className="text-sm text-text-secondary mb-4">
              {GAME_DESCRIPTIONS[room.gameMode]}
            </p>
            {room.gameMode === GameMode.SPY_AND_DECODE && (
              <SpyDecodeUI room={room} user={user} />
            )}
            {room.gameMode === GameMode.HIDE_AND_SEEK && room.gameState.status === "playing" && (
              <HidingPhaseIndicator room={room} />
            )}
            <GameStatus room={room} isFullscreen={isFullscreen} />
            <PlayerList room={room} user={user} />
            {!isMobile && room.gameState.status === "waiting" && (
              <div className="flex items-center justify-center my-3">
                <input
                  id="fullscreen-checkbox"
                  type="checkbox"
                  checked={requestFullscreenOnStart}
                  onChange={(e) => setRequestFullscreenOnStart(e.target.checked)}
                  className="w-4 h-4 text-primary bg-surface-200 border-border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <label
                  htmlFor="fullscreen-checkbox"
                  className="ml-2 text-sm font-medium text-text-primary"
                >
                  Play in Fullscreen
                </label>
              </div>
            )}
            {room.gameMode === GameMode.MAZE_RACE &&
              room.gameState.status === "waiting" &&
              isHost && (
                <div className="flex flex-col mb-4">
                  <label
                    htmlFor="difficulty-select"
                    className="mb-1 text-sm font-medium text-text-primary"
                  >
                    Select Difficulty
                  </label>
                  <select
                    id="difficulty-select"
                    value={selectedDifficulty}
                    onChange={(e) => {
                      const newDifficulty = e.target.value as MazeRaceDifficulty;
                      setSelectedDifficulty(newDifficulty);
                      socketService.setMazeRaceDifficulty(room.id, user.id, newDifficulty);
                    }}
                    className="p-2 bg-surface-200 border border-border text-text-primary rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {Object.values(MazeRaceDifficulty).map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            <ReactionsComponent buttonClassName="block sm:hidden mt-2" />
            {room.gameMode === GameMode.INFECTION_ARENA && room.gameState.status === 'playing' && !isMobile && (
              <InfectionAbilityButton room={room} user={user} onAction={handleGenericAction} />
            )}
            {room.gameMode === GameMode.HEIST_PANIC && room.gameState.status === 'playing' && !isMobile && (
              <HeistPanicUI room={room} user={user} onGuessSubmit={handleGenericAction} />
            )}
            {room.gameMode === GameMode.HIDE_AND_SEEK && room.gameState.status === 'playing' && !isMobile && (
              <HideAndSeekUI room={room} user={user} onAction={handleGenericAction} />
            )}
            <GameControls
              room={room}
              isHost={isHost}
              onStartGame={handleStartGame}
              onLeaveRoom={leaveRoom}
            />
          </div>
        )}
      </div>
      <ReactionsComponent buttonClassName="hidden sm:block fixed bottom-6 left-6 z-50" />
    </>
  );
};

export default GamePage;
