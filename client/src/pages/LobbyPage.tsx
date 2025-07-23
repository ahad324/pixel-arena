
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GameMode } from "../types";
import { socketService } from "@services/socketService";
import { PLAYER_COLORS, getGameModeStatus } from "@constants/index";
import {
  TagIcon,
  TerritoryIcon,
  MazeIcon,
  EnterIcon,
  CreateIcon,
  InfectionIcon,
  TrapIcon,
  SpyIcon,
  InfoIcon,
  HeistIcon,
  HideAndSeekIcon,
  GearIcon
} from "@components/icons";
import InstructionsModal from "@components/InstructionsModal";
import Loader from "@components/Loader";
import { useGame } from "@contexts/GameContext";
import GameModeCard from "@components/GameModeCard";
import ProcessingOverlay from "@components/ui/ProcessingOverlay";
import ConnectionBanner from "@components/ui/ConnectionBanner";
import SettingsModal from "@components/SettingsModal";

const LobbyPage: React.FC = () => {
  const { user, joinRoom: onJoinRoom, isConnected, connectionError, isConnectionWarningDismissed, dismissConnectionWarning, resetConnectionWarning } = useGame();
  const navigate = useNavigate();
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(GameMode.TAG);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [availableRooms, setAvailableRooms] = useState<{ id: string; gameMode: GameMode; playerCount: number }[]>([]);
  const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState("");
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      setIsProcessing(false);
      setIsLoadingRooms(false);
    } else {
      setIsLoadingRooms(true);
      socketService.getAvailableRooms();
    }
  }, [isConnected]);

  useEffect(() => {
    const handleRoomsUpdate = (rooms: { id: string; gameMode: GameMode; playerCount: number }[]) => {
      setAvailableRooms(rooms);
      setIsLoadingRooms(false);
    };
    socketService.onAvailableRoomsUpdate(handleRoomsUpdate);

    // Initial fetch
    if (isConnected) {
      socketService.getAvailableRooms();
    }

    return () => socketService.offAvailableRoomsUpdate();
  }, [isConnected]);

  const checkConnection = () => {
    if (!isConnected) {
      resetConnectionWarning();
      return false;
    }
    return true;
  };

  const handleCreateRoom = () => {
    if (!checkConnection() || isProcessing || !user) return;
    setIsProcessing(true);
    setProcessingText("Creating Room...");
    socketService.createRoom(user, selectedGameMode, (room) => {
      onJoinRoom(room);
      navigate(`/rooms/${room.id}`);
    });
  };

  const handleJoinWithCode = (code: string) => {
    if (!checkConnection() || !code || isProcessing || !user) return;
    setIsProcessing(true);
    setProcessingText("Joining Room...");
    socketService.joinRoom(code.toUpperCase(), user, ({ room, error }) => {
      if (room) {
        onJoinRoom(room);
        navigate(`/rooms/${room.id}`);
      } else {
        setError(error || "An unknown error occurred.");
        setTimeout(() => setError(""), 3000);
        setIsProcessing(false);
        setProcessingText("");
      }
    });
  };

  const gameModeIcons: Record<string, React.ReactNode> = {
    [GameMode.TAG]: <TagIcon className="h-8 w-8" />,
    [GameMode.TERRITORY_CONTROL]: <TerritoryIcon className="h-8 w-8" />,
    [GameMode.MAZE_RACE]: <MazeIcon className="h-8 w-8" />,
    [GameMode.HEIST_PANIC]: <HeistIcon className="h-8 w-8" />,
    [GameMode.INFECTION_ARENA]: <InfectionIcon className="h-8 w-8" />,
    [GameMode.TRAP_RUSH]: <TrapIcon className="h-8 w-8" />,
    [GameMode.SPY_AND_DECODE]: <SpyIcon className="h-8 w-8" />,
    [GameMode.HIDE_AND_SEEK]: <HideAndSeekIcon className="h-8 w-8" />,
  };

  return (
    <>
      <ConnectionBanner
        isVisible={!isConnected && !isConnectionWarningDismissed}
        error={connectionError}
        onDismiss={dismissConnectionWarning}
      />
      <ProcessingOverlay isVisible={isProcessing} text={processingText} />
      {isInstructionsVisible && <InstructionsModal gameMode={selectedGameMode} onClose={() => setIsInstructionsVisible(false)} />}
      <SettingsModal isOpen={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} />

      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12 relative"
          >
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl tracking-tighter mb-4 text-text-primary">GAME LOBBY</h1>
            <p className="text-lg sm:text-xl text-text-secondary">
              Welcome back, <span className="text-text-primary font-bold">{user?.name}</span>
            </p>
            <motion.button
              onClick={() => setIsSettingsVisible(true)}
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-0 right-0 w-10 h-10 sm:w-12 sm:h-12 bg-surface-100 hover:bg-surface-200 border border-primary rounded-xl flex items-center justify-center transition-all duration-300 group"
              aria-label="Settings"
            >
              <GearIcon className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary group-hover:text-primary transition-colors" />
            </motion.button>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-semibold sm:text-3xl mb-6 text-text-primary text-center md:text-left"
          >
            Select a Game Mode
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-12"
          >
            {(Object.values(GameMode) as GameMode[]).map((mode, index) => {
              const status = getGameModeStatus(mode);
              return (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GameModeCard
                    mode={mode}
                    icon={gameModeIcons[mode]}
                    selected={selectedGameMode === mode}
                    onSelect={() => setSelectedGameMode(mode)}
                    status={status}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12"
          >
            <div className="bg-surface-100 border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-2xl font-semibold sm:text-3xl mb-4 flex items-center text-text-primary">
                <CreateIcon className="w-8 h-8 mr-4 text-accent" />
                Create Room
              </h2>
              <p className="text-text-secondary mb-8 leading-relaxed text-base sm:text-lg">
                Start a new game of <span className="font-bold text-text-primary">{selectedGameMode}</span> and invite friends.
              </p>
              <div className="flex gap-4">
                <motion.button
                  onClick={handleCreateRoom}
                  disabled={isProcessing || !isConnected}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-grow bg-accent text-text-on-primary py-3 sm:py-4 px-6 rounded-xl shadow-lg hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? <Loader className="w-5 h-5 text-text-on-primary" /> : "Create Room"}
                </motion.button>
                <motion.button
                  onClick={() => setIsInstructionsVisible(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-surface-100 hover:bg-surface-200 border border-primary text-text-secondary hover:text-text-primary font-bold p-3 sm:p-4 rounded-xl transition-all duration-200"
                  aria-label="How to Play"
                >
                  <InfoIcon className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            <div className="bg-surface-100 border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-2xl font-semibold sm:text-3xl mb-4 flex items-center text-text-primary">
                <EnterIcon className="w-8 h-8 mr-4 text-primary" />
                Join Room
              </h2>
              <p className="text-text-secondary mb-8 leading-relaxed text-base sm:text-lg">Enter a room code to join an existing game.</p>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleJoinWithCode(joinCode)}
                    className="flex-grow px-4 py-3 sm:py-4 bg-surface-200 border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-all duration-200 uppercase font-mono text-lg"
                    placeholder="ROOM CODE"
                    maxLength={6}
                    disabled={!isConnected}
                  />
                  <motion.button
                    onClick={() => handleJoinWithCode(joinCode)}
                    disabled={!joinCode || isProcessing || !isConnected}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-primary text-text-on-primary py-3 sm:py-4 px-8 rounded-xl shadow-lg hover:bg-primary-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                  >
                    {isProcessing ? <Loader className="w-5 h-5 text-text-on-primary" /> : "Join"}
                  </motion.button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-error text-sm font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface-100 border border-border rounded-3xl p-6 sm:p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-semibold sm:text-3xl mb-8 text-text-primary">Available Rooms</h2>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto scrollbar-thin">
              {isLoadingRooms && isConnected ? (
                <div className="flex justify-center items-center py-16">
                  <Loader className="w-8 h-8" text="Loading rooms..." containerClassName="flex-col" />
                </div>
              ) : !isConnected ? (
                <div className="text-center py-16">
                  <div className="text-text-secondary mb-6">
                    <p className="text-2xl font-bold mb-2">Connection Error</p>
                    <p className="text-lg">Cannot fetch available rooms. Please check your connection.</p>
                  </div>
                </div>
              ) : availableRooms.length > 0 ? (
                availableRooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, backgroundColor: "hsl(var(--surface-200-hsl))" }}
                    className="bg-surface-200 border border-border rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-border/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4 sm:space-x-6 flex-grow min-w-0">
                      <div className="text-primary">{gameModeIcons[room.gameMode]}</div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-text-primary text-lg sm:text-xl truncate">{room.gameMode}</p>
                        <p className="text-sm text-text-secondary">
                          Code: <span className="font-mono text-warning font-bold text-base">{room.id}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right flex-grow sm:flex-grow-0">
                        <p className="text-text-primary font-bold text-lg">
                          {room.playerCount} / {PLAYER_COLORS.length}
                        </p>
                        <p className="text-xs text-text-secondary uppercase tracking-wider">players</p>
                      </div>
                      <motion.button
                        onClick={() => handleJoinWithCode(room.id)}
                        disabled={isProcessing || !isConnected}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary text-text-on-primary py-3 px-6 rounded-xl shadow-lg hover:bg-primary-hover transition-all duration-200 disabled:opacity-50"
                      >
                        Join
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="text-text-secondary mb-6">
                    <CreateIcon className="w-20 h-20 mx-auto mb-6 opacity-30" />
                    <p className="text-2xl font-bold mb-2">No rooms available</p>
                    <p className="text-lg">Be the first to create one!</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LobbyPage;
