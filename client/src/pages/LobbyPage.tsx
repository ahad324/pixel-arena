
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
        className={`relative overflow-hidden p-4 md:p-6 border-2 rounded-lg text-left transition-all duration-300 w-full h-full flex flex-col transform hover:scale-105 ${selected
          ? "border-blue-500 bg-blue-900/50 shadow-lg shadow-blue-500/20 animate-bounce-subtle"
          : "border-gray-700 bg-gray-800 hover:bg-gray-700/50 hover:border-blue-700 hover:shadow-lg"
          }`}
      >
        <div className="flex items-center mb-2">
          <div className="transform transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          <h3 className="text-xl font-bold ml-3">{mode}</h3>
        </div>
        <p className="text-sm text-gray-400 flex-grow">{GAME_DESCRIPTIONS[mode]}</p>
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
      <InfectionIcon className="h-8 w-8 text-lime-500" />
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
          <h1 className="text-4xl font-bold tracking-wider">GAME LOBBY</h1>
          <p className="text-gray-400 mt-2">
            Welcome,{" "}
            <span className="text-blue-400 font-bold">{user?.name}</span>!
            Choose your game.
          </p>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="absolute top-0 right-0 w-6 h-6 sm:h-10 sm:w-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 group"
            aria-label="Logout"
          >
            <PowerIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
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
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <CreateIcon className="w-8 h-8 mr-2 text-green-400" /> Create a
              Room
            </h2>
            <p className="text-gray-400 mb-4 flex-grow">
              Start a new game of{" "}
              <span className="font-bold text-white">{selectedGameMode}</span>{" "}
              and invite friends.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCreateRoom}
                disabled={isProcessing}
                className="h-12 flex-grow bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transform hover:scale-105 transition-transform duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? <Spinner className="w-6 h-6" /> : "Create Room"}
              </button>
              <button
                onClick={() => setIsInstructionsVisible(true)}
                className="flex-shrink-0 bg-gray-600 hover:bg-gray-700 text-white font-bold p-3 rounded focus:outline-none focus:shadow-outline transform hover:scale-105 transition-transform duration-200"
                aria-label="How to Play"
              >
                <InfoIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <EnterIcon className="w-8 h-8 mr-2 text-blue-400" /> Join with
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
                className="flex-grow shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase placeholder-gray-500"
                placeholder="ROOM CODE"
                maxLength={6}
              />
              <button
                onClick={() => handleJoinWithCode(joinCode)}
                disabled={!joinCode || isProcessing}
                className="h-12 w-20 flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transform hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? <Spinner className="w-6 h-6" /> : "Join"}
              </button>
            </div>
            <p className={`text-red-500 text-sm mt-2 h-5 transition-all duration-300 ${error ? 'animate-shake' : ''}`}>{error}</p>
          </div>
      </motion.div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {isLoadingRooms ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : availableRooms.length > 0 ? (
            availableRooms.map((room) => (
              <div
                key={room.id}
                className="bg-gray-800/80 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700/60 transition-colors"
              >
                <div>
                  <p className="font-bold text-lg">{room.gameMode}</p>
                  <p className="text-sm text-gray-400">
                    Room Code:{" "}
                    <span className="font-mono text-yellow-400">
                      {room.id}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-gray-300">
                    {room.playerCount} / {PLAYER_COLORS.length}
                  </p>
                  <button
                    onClick={() => handleJoinWithCode(room.id)}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-8 bg-gray-800/50 rounded-lg">
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
