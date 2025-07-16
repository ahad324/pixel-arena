import React, { useState, useEffect, useRef } from "react";
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
import { EnterFullscreenIcon, InfoIcon, CheckCircleIcon } from "@components/icons";

const GamePage: React.FC = () => {
  const { user, room, leaveRoom, endGame, heistPadFeedback } = useGame();
  const { isMobile } = useDeviceDetection();
  const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);
  const [requestFullscreenOnStart, setRequestFullscreenOnStart] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(MazeRaceDifficulty.EASY);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  const { copied, handleCopy } = useClipboard(room?.id || "");

  usePlayerMovement(user!, room!, isMobile);

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
  }, [room?.gameState.status, isFullscreen, exitFullscreen]);

  // Sync selectedDifficulty with room state
  useEffect(() => {
    if (room?.mazeRaceSettings?.difficulty) {
      setSelectedDifficulty(room.mazeRaceSettings.difficulty);
    }
  }, [room?.mazeRaceSettings?.difficulty]);

  // Listen for difficulty changes from other players
  useEffect(() => {
    const handleDifficultyChange = (data: { difficulty: MazeRaceDifficulty; room: Room }) => {
      setSelectedDifficulty(data.difficulty);
    };

    socketService.onMazeDifficultyChanged(handleDifficultyChange);

    return () => {
      socketService.offMazeDifficultyChanged();
    };
  }, []);

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
              ? "fixed inset-0 bg-gray-900 flex items-center justify-center z-50 p-2"
              : "flex-grow flex items-center justify-center relative min-h-[300px] lg:min-h-0"
          }
        >
          <GameBoard room={room} heistPadFeedback={heistPadFeedback} user={user} />
          {isMobile && room.gameState.status === "playing" && (
            <VirtualJoystick room={room} user={user} />
          )}
          {isMobile && room.gameState.status === "playing" && !isFullscreen && (
            <button
              onClick={handleReEnterFullscreen}
              className="absolute top-4 right-4 z-50 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition-colors animate-pulse"
              aria-label="Enter fullscreen"
            >
              <EnterFullscreenIcon className="w-8 h-8" />
            </button>
          )}
        </div>

        {!isFullscreen && (
          <div className="lg:w-80 flex-shrink-0 bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-2xl font-bold">{room.gameMode}</h2>
              <button
                onClick={() => setIsInstructionsVisible(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                aria-label="How to Play"
              >
                {room.gameState.status === "waiting" && (
                  <span className="text-sm font-semibold">How to play</span>
                )}
                <InfoIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center mb-2">
              <p className="text-sm text-gray-400">
                Room Code:{" "}
                <span
                  className="font-bold text-yellow-400 tracking-widest cursor-pointer"
                  onClick={handleCopy}
                >
                  {room.id}
                </span>
              </p>
              {copied && (
                <div className="ml-2 flex items-center text-green-400 text-xs animate-in fade-in">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  <span>Copied!</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {GAME_DESCRIPTIONS[room.gameMode]}
            </p>

            {room.gameMode === GameMode.SPY_AND_DECODE && (
              <SpyDecodeUI room={room} user={user} />
            )}
            <GameStatus room={room} isFullscreen={isFullscreen} />

            <PlayerList room={room} user={user} />

            {!isMobile && room.gameState.status === "waiting" && (
              <div className="flex items-center justify-center my-3">
                <input
                  id="fullscreen-checkbox"
                  type="checkbox"
                  checked={requestFullscreenOnStart}
                  onChange={(e) =>
                    setRequestFullscreenOnStart(e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-600 derin-gray-500 rounded focus:ring-2"
                />
                <label
                  htmlFor="fullscreen-checkbox"
                  className="ml-2 text-sm font-medium text-gray-300"
                >
                  Play in Fullscreen
                </label>
              </div>
            )}

            {room.gameMode === GameMode.MAZE_RACE &&
              room.gameState.status === "waiting" &&
              isHost && (
                <div className="flex flex-col mb-4">
                  <label htmlFor="difficulty-select" className="mb-1 text-sm font-medium text-gray-300">
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
                    className="p-2 bg-gray-700 border border-gray-600 text-white rounded-md"
                  >
                    {Object.values(MazeRaceDifficulty).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            {room.gameMode === GameMode.INFECTION_ARENA &&
              room.gameState.status === "playing" && (
                <InfectionAbilityButton room={room} user={user} />
              )}
            {room.gameMode === GameMode.HEIST_PANIC &&
              room.gameState.status === "playing" && (
                <HeistPanicUI room={room} user={user} />
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
    </>
  );
};

export default GamePage;