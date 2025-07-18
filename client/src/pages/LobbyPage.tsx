
import React, { useState, useEffect } from "react";
import { motion, easeOut } from "framer-motion";
import { GameMode } from "../types";
import { socketService } from "@services/socketService";
import { GAME_DESCRIPTIONS, PLAYER_COLORS, getGameModeStatus, GameStatus } from "@constants/index";
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
  PowerIcon
} from "@components/icons";
import InstructionsModal from "@components/InstructionsModal";
import Spinner from "@components/Spinner";
import { useGame } from "@contexts/GameContext";
import { StatusBadge } from "@components/StatusBadge";

interface GameModeCardProps {
  mode: GameMode;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  status?: GameStatus | null;
}

const GameModeCard: React.FC<GameModeCardProps> = ({
  mode,
  icon,
  selected,
  onSelect,
  status,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onSelect}
        className={`relative overflow-hidden p-4 md:p-6 border-2 rounded-lg text-left transition-all duration-300 w-full h-full flex flex-col transform hover:scale-105 group ${selected
          ? "border-primary bg-primary/20 shadow-lg shadow-primary/20 animate-bounce-subtle"
          : "border-border bg-surface-100 hover:bg-surface-200 hover:border-primary/50 hover:shadow-lg"
          }`}
      >
        <div className="flex items-center mb-2">
          <div className="transform transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          <h3 className="text-xl font-bold ml-3 text-text-primary">{mode}</h3>
        </div>
        <p className="text-sm text-text-secondary flex-grow">{GAME_DESCRIPTIONS[mode]}</p>
      </button>
      {status && <StatusBadge status={status} />}
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut
    }
  }
};

const LobbyPage: React.FC = () => {
  const { user, joinRoom: onJoinRoom, logout } = useGame();
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(
    GameMode.TAG
  );
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [availableRooms, setAvailableRooms] = useState<
    { id: string; gameMode: GameMode; playerCount: number }[]
  >([]);
  const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    const handleRoomsUpdate = (
      rooms: { id: string; gameMode: GameMode; playerCount: number }[]
    ) => {
      setAvailableRooms(rooms);
      setIsLoadingRooms(false);
    };
    socketService.onAvailableRoomsUpdate(handleRoomsUpdate);
    socketService.getAvailableRooms();

    return () => socketService.offAvailableRoomsUpdate();
  }, []);

  const handleCreateRoom = () => {
    if (isProcessing || !user) return;
    setIsProcessing(true);
    socketService.createRoom(user, selectedGameMode, onJoinRoom);
  };

  const handleJoinWithCode = (code: string) => {
    if (!code || isProcessing || !user) return;
    setIsProcessing(true);
    socketService.joinRoom(code.toUpperCase(), user, ({ room, error }) => {
      if (room) {
        onJoinRoom(room);
      } else {
        setError(error || "An unknown error occurred.");
        setTimeout(() => setError(""), 3000);
        setIsProcessing(false);
      }
    });
  };

  const gameModeIcons: Record<string, React.ReactNode> = {
    [GameMode.TAG]: <TagIcon className="h-8 w-8 text-red-500" />,
    [GameMode.TERRITORY_CONTROL]: (
      <TerritoryIcon className="h-8 w-8 text-green-500" />
    ),
    [GameMode.MAZE_RACE]: <MazeIcon className="h-8 w-8 text-yellow-500" />,
    [GameMode.HEIST_PANIC]: (
      <HeistIcon className="h-8 w-8 text-blue-500" />
    ),
    [GameMode.INFECTION_ARENA]: (
      <InfectionIcon className="h-8 w-8 text-lime-400" />
    ),
    [GameMode.TRAP_RUSH]: <TrapIcon className="h-8 w-8 text-orange-500" />,
    [GameMode.SPY_AND_DECODE]: <SpyIcon className="h-8 w-8 text-indigo-500" />,
  };

  return (
    <>
      {isInstructionsVisible && (
        <InstructionsModal
          gameMode={selectedGameMode}
          onClose={() => setIsInstructionsVisible(false)}
        />
      )}
      <motion.div className="w-full max-w-6xl mx-auto animate-in fade-in duration-500">
        <div className="text-center mb-8 relative pt-10 sm:pt-10">
          <h1 className="text-4xl font-bold tracking-wider text-text-primary">GAME LOBBY</h1>
          <p className="text-text-secondary mt-2">
            Welcome,{" "}
            <span className="text-primary font-bold">{user?.name}</span>!
            Choose your game.
          </p>

          <button
            onClick={logout}
            className="absolute top-0 right-0 w-10 h-10 bg-error/20 hover:bg-error/40 border border-error/50 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-error/30 group"
            aria-label="Logout"
          >
            <PowerIcon className="w-5 h-5 text-error group-hover:scale-110 transition-transform" />
          </button>
        </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {(Object.values(GameMode) as GameMode[]).map((mode) => {
            const status = getGameModeStatus(mode);
            return (
              <GameModeCard
                key={mode}
                mode={mode}
                icon={gameModeIcons[mode]}
                selected={selectedGameMode === mode}
                onSelect={() => setSelectedGameMode(mode)}
                status={status}
              />
            );
          })}
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-surface-100 border border-border rounded-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-text-primary">
              <CreateIcon className="w-8 h-8 mr-2 text-accent" /> Create a
              Room
            </h2>
            <p className="text-text-secondary mb-4 flex-grow">
              Start a new game of{" "}
              <span className="font-bold text-text-primary">{selectedGameMode}</span>{" "}
              and invite friends.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCreateRoom}
                disabled={isProcessing}
                className="h-12 flex-grow bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transform hover:scale-105 transition-transform duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? <Spinner className="w-6 h-6" /> : "Create Room"}
              </button>
              <button
                onClick={() => setIsInstructionsVisible(true)}
                className="flex-shrink-0 bg-surface-200 hover:bg-border text-text-secondary hover:text-text-primary font-bold p-3 rounded-md focus:outline-none focus:shadow-outline transform hover:scale-105 transition-transform duration-200"
                aria-label="How to Play"
              >
                <InfoIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="bg-surface-100 border border-border rounded-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-text-primary">
              <EnterIcon className="w-8 h-8 mr-2 text-primary" /> Join with
              Code
            </h2>
            <div className="flex gap-2 flex-grow items-center">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleJoinWithCode(joinCode)
                }
                className="flex-grow shadow appearance-none border border-border rounded-md w-full py-3 px-4 bg-surface-200 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all uppercase placeholder-text-secondary"
                placeholder="ROOM CODE"
                maxLength={6}
              />
              <button
                onClick={() => handleJoinWithCode(joinCode)}
                disabled={!joinCode || isProcessing}
                className="h-12 w-20 flex-shrink-0 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transform hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? <Spinner className="w-6 h-6" /> : "Join"}
              </button>
            </div>
            <p className={`text-error text-sm mt-2 h-5 transition-all duration-300 ${error ? 'animate-shake' : ''}`}>{error}</p>
          </div>
      </motion.div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Available Rooms</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {isLoadingRooms ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : availableRooms.length > 0 ? (
            availableRooms.map((room) => (
              <div
                key={room.id}
                className="bg-surface-100/80 border border-border rounded-lg p-4 flex items-center justify-between hover:bg-surface-200/60 transition-colors"
              >
                <div>
                  <p className="font-bold text-lg text-text-primary">{room.gameMode}</p>
                  <p className="text-sm text-text-secondary">
                    Room Code:{" "}
                    <span className="font-mono text-warning">
                      {room.id}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-text-secondary">
                    {room.playerCount} / {PLAYER_COLORS.length}
                  </p>
                  <button
                    onClick={() => handleJoinWithCode(room.id)}
                    disabled={isProcessing}
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-text-secondary text-center py-8 bg-surface-100/50 rounded-lg">
              <p>No public rooms available.</p>
              <p>Why not create one?</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LobbyPage;
