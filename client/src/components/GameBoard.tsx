

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { Player, Room, Footprint } from "../types";
import { GameMode, MazeRaceDifficulty } from "../types";
import { GRID_SIZE } from "@constants/index";
import PlayerAvatar from "@components/PlayerAvatar";
import { FreezeIcon, SlowIcon, TeleportIcon } from "@components/icons";
import { useGame } from "@contexts/GameContext";
import { AnimatePresence, motion } from "framer-motion";

interface GameBoardProps {
  room: Room;
  user: Omit<Player, "socketId"> | null;
  heistPadFeedback?: { [padId: string]: "correct" | "incorrect" };
}

const Footprint: React.FC<{ footprint: Footprint; cellSize: number; color: string }> = ({ footprint, cellSize, color }) => {
  return (
    <motion.div
      key={`${footprint.x}-${footprint.y}-${footprint.timestamp}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute"
      style={{
        left: footprint.x * cellSize,
        top: footprint.y * cellSize,
        width: cellSize,
        height: cellSize,
      }}
    >
      <div
        className="w-full h-full opacity-30"
        style={{
          backgroundColor: color,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      />
    </motion.div>
  );
};

const GhostAvatar: React.FC<{ x: number; y: number; cellSize: number; rotation: number; }> = ({ x, y, cellSize, rotation }) => (
  <div
    className="absolute transition-transform duration-1000 ease-in-out pointer-events-none animate-in fade-in animate-out fade-out-50"
    style={{ left: x * cellSize, top: y * cellSize, width: cellSize, height: cellSize, transform: `rotate(${rotation}deg)`, }}
  >
    <div className="w-full h-full p-[10%]">
      <div className="w-full h-full rounded-full bg-slate-500 opacity-40 blur-sm"></div>
    </div>
  </div>
);

const GameBoard: React.FC<GameBoardProps> = ({ room, user, heistPadFeedback, }) => {
  const { players, gameState, gameMode } = room;
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(32);
  const [ghosts, setGhosts] = useState<{ x: number; y: number; id: string }[]>([]);
  const [clientRotation, setClientRotation] = useState(0);

  const { user: currentUser } = useGame();
  const self = players.find(p => p.id === currentUser?.id);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { offsetWidth, offsetHeight } = container;
      const minDimension = Math.min(offsetWidth, offsetHeight);
      const newCellSize = Math.max(1, Math.floor(minDimension / GRID_SIZE));
      setCellSize(newCellSize);
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    updateSize(); // Initial size check
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (gameMode !== GameMode.MAZE_RACE || gameState.status !== "playing") {
      if (clientRotation !== 0) setClientRotation(0);
      return;
    }
    const difficulty = gameState.maze?.difficulty || MazeRaceDifficulty.EASY;
    const shouldRotate = difficulty === MazeRaceDifficulty.HARD || difficulty === MazeRaceDifficulty.EXPERT;
    if (!shouldRotate) {
      if (clientRotation !== 0) setClientRotation(0);
      return;
    }
    const rotationInterval = setInterval(() => { setClientRotation((prev) => (prev + 90) % 360); }, 12000);
    return () => clearInterval(rotationInterval);
  }, [gameMode, gameState.status, gameState.maze?.difficulty, clientRotation]);

  useEffect(() => {
    if (gameMode !== GameMode.MAZE_RACE || gameState.status !== "playing" || !gameState.maze) {
      setGhosts([]);
      return;
    }
    const difficulty = gameState.maze?.difficulty || MazeRaceDifficulty.EASY;
    const shouldShowGhosts = difficulty === MazeRaceDifficulty.EXPERT;
    if (!shouldShowGhosts) {
      setGhosts([]);
      return;
    }
    const emptyCells: { x: number; y: number }[] = [];
    gameState.maze.grid.forEach((row, y) => { row.forEach((cell, x) => { if (cell === 0) emptyCells.push({ x, y }); }); });
    const ghostInterval = setInterval(() => {
      if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { x, y } = emptyCells[randomIndex];
        const newGhost = { x, y, id: crypto.randomUUID() };
        setGhosts((prev) => [...prev, newGhost]);
        setTimeout(() => { setGhosts((prev) => prev.filter((g) => g.id !== newGhost.id)); }, 2000 + Math.random() * 2000);
      }
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(ghostInterval);
  }, [gameMode, gameState.status, gameState.maze]);

  const boardSize = GRID_SIZE * cellSize;

  const fogOfWarOverlayStyle = useMemo(() => {
    if ((gameMode !== GameMode.MAZE_RACE && gameMode !== GameMode.HIDE_AND_SEEK) || gameState.status !== "playing" || !user) {
      return null;
    }

    const currentPlayer = players.find((p) => p.id === user.id);
    if (!currentPlayer) return { background: "rgba(13, 17, 23, 0.98)" };

    let visibilityInCells = Infinity;
    if (gameMode === GameMode.MAZE_RACE) {
      const difficulty = gameState.maze?.difficulty || MazeRaceDifficulty.EASY;
      if (difficulty === MazeRaceDifficulty.MEDIUM || difficulty === MazeRaceDifficulty.EXPERT) {
        visibilityInCells = 4.5;
      }
    } else if (gameMode === GameMode.HIDE_AND_SEEK) {
      visibilityInCells = currentPlayer.isSeeker ? 7.5 : 4.5;
    }

    if (visibilityInCells === Infinity) return null;

    const visibilityRadiusPx = visibilityInCells * cellSize;
    const playerCenterX = currentPlayer.x * cellSize + cellSize / 2;
    const playerCenterY = currentPlayer.y * cellSize + cellSize / 2;
    const gradient = `radial-gradient(circle ${visibilityRadiusPx}px at ${playerCenterX}px ${playerCenterY}px, transparent 0%, transparent 70%, rgba(13, 17, 23, 0.98) 100%)`;
    return { background: gradient };
  }, [gameMode, gameState.status, gameState.maze?.difficulty, players, user, cellSize]);

  const renderGameSpecificElements = () => {
    switch (gameMode) {
      case GameMode.TERRITORY_CONTROL:
        return gameState.tiles?.flat().map((tile, index) => tile.color ? (
          <div key={index} className="absolute transition-colors duration-500" style={{ left: `${(index % GRID_SIZE) * cellSize}px`, top: `${Math.floor(index / GRID_SIZE) * cellSize}px`, width: cellSize, height: cellSize, backgroundColor: tile.color, opacity: 0.4, }} ></div>) : null);
      case GameMode.MAZE_RACE:
      case GameMode.HIDE_AND_SEEK:
        const mazeElements = gameState.maze?.grid.map((row, y) => row.map((cell, x) => cell === 1 ? (
          <div key={`${x}-${y}`} className="absolute bg-surface-200 border border-border" style={{ left: x * cellSize, top: y * cellSize, width: cellSize, height: cellSize, }} ></div>
        ) : gameMode === GameMode.MAZE_RACE && gameState.maze?.end && y === gameState.maze.end.y && x === gameState.maze.end.x ? (
          <div key="end-point" className="absolute bg-accent/50 rounded-full animate-pulse" style={{ left: x * cellSize + cellSize / 4, top: y * cellSize + cellSize / 4, width: cellSize / 2, height: cellSize / 2, }} ></div>
        ) : null));

        if (gameMode === GameMode.HIDE_AND_SEEK && self?.isSeeker) {
          const footprints = (
            <AnimatePresence>
              {gameState.footprints?.map((fp) => {
                const p = players.find(pl => pl.id === fp.playerId);
                return p ? <Footprint key={`${fp.x}-${fp.y}-${fp.timestamp}`} footprint={fp} cellSize={cellSize} color={p.color} /> : null;
              })}
            </AnimatePresence>
          );
          return [mazeElements, footprints];
        }
        return mazeElements;

      case GameMode.HEIST_PANIC:
        return gameState.codePads?.map((pad) => {
          const feedback = heistPadFeedback?.[pad.id];
          let feedbackClass = "bg-warning/20 border-warning animate-pulse";
          let feedbackContent = "?";
          if (feedback === "incorrect") {
            feedbackClass = "bg-error/50 border-error animate-pulse";
            feedbackContent = "X";
          } else if (feedback === "correct") {
            feedbackClass = "bg-accent/50 border-accent animate-pulse";
            feedbackContent = "✓";
          }
          return (
            <div key={pad.id} className="absolute" style={{ left: pad.x * cellSize, top: pad.y * cellSize, width: cellSize, height: cellSize, }}>
              <div className={`w-full h-full border-2 rounded-md flex items-center justify-center font-bold transition-all duration-300 ${feedbackClass}`}>
                {feedbackContent}
              </div>
            </div>
          );
        });
      case GameMode.TRAP_RUSH: {
        const trapElements = gameState.trapMap?.flatMap((row, y) => row.map((trap, x) => {
          if (!trap || !trap.revealed) return null;
          const trapIcons = { freeze: <FreezeIcon className="w-full h-full text-cyan-400" />, slow: <SlowIcon className="w-full h-full text-orange-400" />, teleport: (<TeleportIcon className="w-full h-full text-purple-400" />), };
          return (
            <div key={`${x}-${y}`} className="absolute p-2" style={{ left: x * cellSize, top: y * cellSize, width: cellSize, height: cellSize, }}>
              <div className="w-full h-full bg-surface-100/50 rounded-full animate-in fade-in">
                {trapIcons[trap.type]}
              </div>
            </div>
          );
        }));
        const finishLine = (
          <div key="finish-line" className="absolute" style={{ left: 0, top: gameState.finishLine! * cellSize, width: "100%", height: cellSize, backgroundImage: "repeating-conic-gradient(#161B22 0% 25%, #30363D 0% 50%)", backgroundSize: `${cellSize}px ${cellSize}px`, opacity: 0.8, }} ></div>
        );
        return [finishLine, ...(trapElements || [])];
      }
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center" >
      <div className="relative bg-background border-2 border-border rounded-lg overflow-hidden flex-shrink-0" style={{ width: boardSize, height: boardSize, backgroundImage: "linear-gradient(rgba(201, 209, 217, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 209, 217, 0.05) 1px, transparent 1px)", backgroundSize: `${cellSize}px ${cellSize}px`, transform: `rotate(${clientRotation}deg)`, transition: "transform 1s ease-in-out", }} >
        {renderGameSpecificElements()}
        {players.map((player) => (
          <PlayerAvatar key={player.id} player={player} cellSize={cellSize} />
        ))}
        {ghosts.map((g) => (
          <GhostAvatar key={g.id} x={g.x} y={g.y} cellSize={cellSize} rotation={-clientRotation} />
        ))}
        {fogOfWarOverlayStyle && (
          <div className="absolute inset-0 pointer-events-none transition-all duration-300 ease-linear" style={fogOfWarOverlayStyle} ></div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;