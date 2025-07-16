
import React, { useState, useEffect, useRef } from "react";
import type { Player, Room } from "../types";
import { GameMode } from "../types";
import { socketService } from "@services/socketService";
import { usePlayerMovement } from "@hooks/usePlayerMovement";
import { useFullscreen } from "@hooks/useFullscreen";
import GameBoard from "@components/GameBoard";
import EndScreen from "@components/EndScreen";
import InstructionsModal from "@components/InstructionsModal";
import LoadingScreen from "@components/LoadingScreen";
import {
  GAME_DESCRIPTIONS,
  PLAYER_COLORS,
  GAME_SETTINGS,
  INFECTED_COLOR,
} from "@constants/index";
import {
  InfoIcon,
  CheckCircleIcon,
  EnterFullscreenIcon,
} from "@components/icons";
import { useDeviceDetection } from "@hooks/useDeviceDetection";
import VirtualJoystick from "@components/VirtualJoystick";
import { useGame } from "@contexts/GameContext";

const SpyDecodeUI: React.FC<{ room: Room; user: Omit<Player, "socketId"> }> = ({
  room,
  user,
}) => {
  const { gameState } = room;
  const self = room.players.find((p) => p.id === user.id);

  if (gameState.phase === "reveal") {
    const spy = room.players.find((p) => p.isSpy);
    return (
      <div className="bg-indigo-900/40 text-indigo-200 rounded-md p-3 text-center mb-4">
        <h4 className="font-bold">Round Over!</h4>
        <p>
          The correct code was:{" "}
          <span className="font-bold">
            {
              gameState.codes?.find((c) => c.id === gameState.correctCodeId)
                ?.value
            }
          </span>
        </p>
        <p>
          The spy was: <span className="font-bold">{spy?.name}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-indigo-900/40 rounded-md p-3 mb-4">
      <h4 className="font-bold text-center text-indigo-200 mb-2">
        {self?.isSpy ? "You are the SPY!" : "Find the correct code!"}
      </h4>
      {self?.isSpy && (
        <p className="text-center text-xs text-yellow-300 mb-2">
          Secret Code:{" "}
          <span className="font-bold tracking-widest">
            {
              gameState.codes?.find((c) => c.id === gameState.correctCodeId)
                ?.value
            }
          </span>
        </p>
      )}

      {gameState.phase === "guessing" && (
        <div className="grid grid-cols-3 gap-2">
          {gameState.codes?.map((code) => (
            <button
              key={code.id}
              onClick={() =>
                socketService.submitGuess(room.id, user.id, code.id)
              }
              disabled={!!self?.guess}
              className={`p-2 rounded font-bold text-white transition-colors ${
                self?.guess === code.id
                  ? "bg-green-500"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {code.value}
            </button>
          ))}
        </div>
      )}
      {gameState.phase === "signaling" && (
        <p className="text-center text-xs text-indigo-300">
          Signal the code to your allies...
        </p>
      )}
    </div>
  );
};

const InfectionAbilityButton: React.FC<{
  room: Room;
  user: Omit<Player, "socketId">;
}> = ({ room, user }) => {
  const [cooldown, setCooldown] = useState(0);
  const self = room.players.find((p) => p.id === user.id);
  const { isMobile } = useDeviceDetection();

  const { SPRINT_COOLDOWN, SHIELD_COOLDOWN } =
    GAME_SETTINGS[GameMode.INFECTION_ARENA];

  useEffect(() => {
    let intervalId: number | undefined;
    if (
      self &&
      room.gameMode === GameMode.INFECTION_ARENA &&
      room.gameState.status === "playing"
    ) {
      intervalId = window.setInterval(() => {
        const now = Date.now();
        const lastUsed = self.isInfected
          ? self.lastSprintTime
          : self.lastShieldTime;
        const totalCooldown = self.isInfected
          ? SPRINT_COOLDOWN
          : SHIELD_COOLDOWN;
        if (lastUsed) {
          const remaining = Math.max(0, totalCooldown - (now - lastUsed));
          setCooldown(Math.ceil(remaining / 1000));
        } else {
          setCooldown(0);
        }
      }, 500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    self,
    room.gameMode,
    room.gameState.status,
    SPRINT_COOLDOWN,
    SHIELD_COOLDOWN,
  ]);

  if (room.gameMode !== GameMode.INFECTION_ARENA) return null;

  const abilityName = self?.isInfected ? "Sprint" : "Shield";
  const isDisabled = cooldown > 0;

  return (
    <button
      onClick={() => socketService.activateAbility(room.id, user.id)}
      disabled={isDisabled}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
    >
      {isDisabled
        ? `${abilityName} (${cooldown}s)`
        : `Use ${abilityName}${!isMobile ? " (Space)" : ""}`}
    </button>
  );
};

const HeistPanicUI: React.FC<{ room: Room; user: Omit<Player, "socketId"> }> = ({
  room,
  user,
}) => {
  const self = room.players.find((p) => p.id === user.id);
  const { isMobile } = useDeviceDetection();
  const padUnderPlayer = room.gameState.codePads?.find(
    (p) => p.x === self?.x && p.y === self?.y
  );
  const isStunned = !!self?.effects?.some(
    (e) => e.type === "frozen" && e.expires > Date.now()
  );

  if (
    room.gameMode !== GameMode.HEIST_PANIC ||
    room.gameState.status !== "playing"
  ) {
    return null;
  }

  const handleGuess = () => {
    if (padUnderPlayer) {
      socketService.submitHeistGuess(room.id, user.id, padUnderPlayer.id);
    }
  };

  return (
    <button
      onClick={handleGuess}
      disabled={!padUnderPlayer || isStunned}
      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
    >
      {isStunned
        ? "Stunned!"
        : padUnderPlayer
        ? `Attempt Guess${!isMobile ? " (Space)" : ""}`
        : "Move to a Code Pad"}
    </button>
  );
};

const GamePage: React.FC = () => {
  const { user, room, leaveRoom, endGame, heistPadFeedback } = useGame();
  const { isMobile } = useDeviceDetection();

  usePlayerMovement(user!, room!, isMobile);

  const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requestFullscreenOnStart, setRequestFullscreenOnStart] =
    useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

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

  if (!user || !room) {
    return <LoadingScreen />;
  }

  const getStatusMessage = () => {
    const { status, timer, phase } = room.gameState;
    const { gameMode } = room;
    const you = room.players.find((p) => p.id === user.id);

    if (status === "waiting") return "Waiting for host to start...";
    if (timer > 0)
      return `${
        phase
          ? `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase: `
          : "Time Left: "
      }${timer}s`;

    switch (gameMode) {
      case GameMode.TAG:
        return you?.isIt ? "You are It!" : "Don't get tagged!";
      case GameMode.MAZE_RACE:
        return "First to the finish wins!";
      case GameMode.INFECTION_ARENA:
        return you?.isInfected ? "Infect everyone!" : "Don't get infected!";
      case GameMode.TRAP_RUSH:
        return "Get to the finish line!";
      case GameMode.SPY_AND_DECODE:
        return "Awaiting next phase...";
      case GameMode.HEIST_PANIC:
        return "First to the correct code wins!";
      default:
        return "";
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(room.id)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  };

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

  const statusMessage = getStatusMessage();

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
          {isFullscreen && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white font-bold text-lg md:text-2xl px-2 py-2 md:px-6 md:py-3 rounded-xl z-10 pointer-events-none shadow-lg">
              {statusMessage}
            </div>
          )}
          <GameBoard room={room} heistPadFeedback={heistPadFeedback} />
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
                  onClick={handleCopyCode}
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

            <div className="bg-blue-900/40 text-blue-200 rounded-md p-3 text-center mb-4 font-semibold">
              {statusMessage}
            </div>

            {room.gameMode === GameMode.SPY_AND_DECODE && (
              <SpyDecodeUI room={room} user={user} />
            )}

            <h3 className="font-bold mb-2 text-lg">
              Players ({room.players.length}/{PLAYER_COLORS.length})
            </h3>
            <div className="space-y-2 flex-grow mb-4">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className={`p-2 rounded-md flex items-center justify-between text-sm ${
                    p.isEliminated
                      ? "bg-gray-700 text-gray-500 line-through"
                      : "bg-gray-700"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{
                        backgroundColor: p.isInfected
                          ? INFECTED_COLOR
                          : p.color,
                      }}
                    ></div>
                    <span className="font-bold">
                      {p.name}
                      {p.id === user.id ? " (You)" : ""}
                      {p.id === room.hostId ? " 👑" : ""}
                    </span>
                    {p.isIt && (
                      <span className="ml-2 text-red-400 font-bold animate-pulse">
                        (It!)
                      </span>
                    )}
                    {p.isInfected && (
                      <span className="ml-2 text-lime-400 font-bold animate-pulse">
                        (Infected)
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-lg text-blue-300">
                    {p.score}
                  </span>
                </div>
              ))}
            </div>

            {!isMobile && room.gameState.status === "waiting" && (
              <div className="flex items-center justify-center my-3">
                <input
                  id="fullscreen-checkbox"
                  type="checkbox"
                  checked={requestFullscreenOnStart}
                  onChange={(e) =>
                    setRequestFullscreenOnStart(e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-2"
                />
                <label
                  htmlFor="fullscreen-checkbox"
                  className="ml-2 text-sm font-medium text-gray-300"
                >
                  Play in Fullscreen
                </label>
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

            {room.gameState.status === "waiting" && isHost && (
              <button
                onClick={handleStartGame}
                disabled={room.players.length < 1}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-2"
              >
                Start Game
              </button>
            )}
            <button
              onClick={leaveRoom}
              className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Leave Room
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default GamePage;
