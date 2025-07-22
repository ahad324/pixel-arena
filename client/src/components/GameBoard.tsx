import React, { useState, useRef, useEffect, useMemo } from "react";
import type { Player, Room, Footprint } from "../types";
import { GameMode, MazeRaceDifficulty } from "../types";
import { GRID_SIZE } from "@constants/index";
import PlayerAvatar from "@components/PlayerAvatar";
import { FreezeIcon, SlowIcon, TeleportIcon } from "@components/icons";
import { AnimatePresence, motion } from "framer-motion";

interface GameBoardProps {
  room: Room;
  user: Omit<Player, "socketId"> | null;
  heistPadFeedback?: { [padId: string]: "correct" | "incorrect" };
}

const FootprintComponent: React.FC<{ footprint: Footprint; cellSize: number; color: string }> = ({ footprint, cellSize, color }) => {
  return (
    <motion.div
      key={`${footprint.x}-${footprint.y}-${footprint.timestamp}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute"
      style={{
        left: footprint.x * cellSize, top: footprint.y * cellSize, width: cellSize, height: cellSize,
      }}
    >
      <div className="w-full h-full opacity-30" style={{ backgroundColor: color, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
    </motion.div>
  );
};

const GhostAvatar: React.FC<{ x: number; y: number; cellSize: number; rotation: number; }> = ({ x, y, cellSize, rotation }) => (
  <div
    className="absolute transition-transform duration-1000 ease-in-out pointer-events-none animate-in fade-in animate-out fade-out-50"
    style={{ left: x * cellSize, top: y * cellSize, width: cellSize, height: cellSize, transform: `rotate(${rotation}deg)`, }}
  >
    <div className="w-full h-full p-[10%]">
      <div className="w-full h-full rounded-full bg-text-secondary opacity-40 blur-sm"></div>
    </div>
  </div>
);

const GameBoard: React.FC<GameBoardProps> = ({ room, user, heistPadFeedback, }) => {
  const { players, gameState, gameMode } = room;
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(32);
  const [ghosts, setGhosts] = useState<{ x: number; y: number; id: string }[]>([]);
  const [clientRotation, setClientRotation] = useState(0);

  const self = players.find(p => p.id === user?.id);

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
    updateSize();
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    // Rotation is now applicable to Maze Race (on Hard/Expert) and Hide and Seek
    if ((gameMode !== GameMode.MAZE_RACE && gameMode !== GameMode.HIDE_AND_SEEK) || gameState.status !== "playing") {
      if (clientRotation !== 0) setClientRotation(0);
      return;
    }

    const difficulty = gameState.maze?.difficulty || MazeRaceDifficulty.EASY;
    const isMazeRaceRotation = gameMode === GameMode.MAZE_RACE && (difficulty === MazeRaceDifficulty.HARD || difficulty === MazeRaceDifficulty.EXPERT);
    const isHideAndSeekRotation = gameMode === GameMode.HIDE_AND_SEEK;
    const shouldRotate = isMazeRaceRotation || isHideAndSeekRotation;

    if (!shouldRotate) {
      if (clientRotation !== 0) setClientRotation(0);
      return;
    }

    const rotationInterval = setInterval(() => {
      setClientRotation((prev) => (prev + 90) % 360);
    }, 12000); // Rotate every 12 seconds

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
    if (!currentPlayer) return { background: "hsla(var(--background-hsl), 0.98)" };
    let visibilityInCells = Infinity;
    if (gameMode === GameMode.MAZE_RACE) {
      const difficulty = gameState.maze?.difficulty || MazeRaceDifficulty.EASY;
      if (difficulty === MazeRaceDifficulty.MEDIUM || difficulty === MazeRaceDifficulty.HARD || difficulty === MazeRaceDifficulty.EXPERT) {
        visibilityInCells = 4.5;
      }
    } else if (gameMode === GameMode.HIDE_AND_SEEK) {
      visibilityInCells = currentPlayer.isSeeker ? 7.5 : 4.5;
    }
    if (visibilityInCells === Infinity) return null;
    const visibilityRadiusPx = visibilityInCells * cellSize;
    const playerCenterX = currentPlayer.x * cellSize + cellSize / 2;
    const playerCenterY = currentPlayer.y * cellSize + cellSize / 2;
    const gradient = `radial-gradient(circle ${visibilityRadiusPx}px at ${playerCenterX}px ${playerCenterY}px, transparent 0%, transparent 70%, hsla(var(--background-hsl), 0.98) 100%)`;
    return { background: gradient };
  }, [gameMode, gameState.status, gameState.maze?.difficulty, players, user, cellSize]);

  const renderGameSpecificElements = () => {
    switch (gameMode) {
      case GameMode.TERRITORY_CONTROL:
        return gameState.tiles?.flat().map((tile, index) => tile.color ? (
          <div key={index} className="absolute transition-colors duration-500" style={{ left: `${(index % GRID_SIZE) * cellSize}px`, top: `${Math.floor(index / GRID_SIZE) * cellSize}px`, width: cellSize, height: cellSize, backgroundColor: tile.color, opacity: 0.4 }} />) : null);
      case GameMode.MAZE_RACE:
        return gameState.maze?.grid.map((row, y) => row.map((cell, x) => cell === 1 ? (
          <div key={`${x}-${y}`} className="absolute bg-surface-200 border border-border" style={{ left: x * cellSize, top: y * cellSize, width: cellSize, height: cellSize, }} />
        ) : gameState.maze?.end && y === gameState.maze.end.y && x === gameState.maze.end.x ? (
          <motion.div key="end-point" className="absolute bg-accent rounded-full" style={{ left: x * cellSize + cellSize / 4, top: y * cellSize + cellSize / 4, width: cellSize / 2, height: cellSize / 2 }} animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
        ) : null));
      case GameMode.HIDE_AND_SEEK:
        const mazeElements = gameState.maze?.grid.map((row, y) => row.map((cell, x) => cell === 1 ? (
          <div key={`${x}-${y}`} className="absolute bg-surface-200 border border-border" style={{ left: x * cellSize, top: y * cellSize, width: cellSize, height: cellSize, }} />
        ) : null));

        if (self?.isSeeker) {
          const footprints = <AnimatePresence>{gameState.footprints?.map(fp => {
            const player = players.find(pl => pl.id === fp.playerId);
            return player ? <FootprintComponent key={`${fp.x}-${fp.y}-${fp.timestamp}`} footprint={fp} cellSize={cellSize} color={player.color} /> : null
          })
          }</AnimatePresence>;
          return [mazeElements, footprints];
        }
        return mazeElements;
      case GameMode.HEIST_PANIC:
        return gameState.codePads?.map((pad) => {
          const feedback = heistPadFeedback?.[pad.id];
          let feedbackClass = "bg-primary/50 border-primary";
          if (feedback === "incorrect") feedbackClass = "bg-error/50 border-error animate-pulse";
          else if (feedback === "correct") feedbackClass = "bg-accent/50 border-accent animate-pulse";
          return <div key={pad.id} className={`absolute rounded-md border flex items-center justify-center font-bold transition-all duration-300 ${feedbackClass}`} style={{ left: pad.x * cellSize, top: pad.y * cellSize, width: cellSize, height: cellSize }}><span className="text-text-primary text-opacity-50 text-xs">?</span></div>;
        });
      case GameMode.TRAP_RUSH: {
        const trapElements = gameState.trapMap?.flatMap((row, y) => row.map((trap, x) => !trap || !trap.revealed ? null : <div key={`${x}-${y}`} className="absolute p-1" style={{ left: x * cellSize, top: y * cellSize, width: cellSize, height: cellSize }}><div className="w-full h-full bg-surface-200/80 rounded-full flex items-center justify-center">{trap.type === "freeze" ? <FreezeIcon className="w-2/3 h-2/3 text-primary" /> : trap.type === "slow" ? <SlowIcon className="w-2/3 h-2/3 text-warning" /> : <TeleportIcon className="w-2/3 h-2/3 text-accent-secondary" />}</div></div>));
        const finishLine = <div key="finish-line" className="absolute" style={{ left: 0, top: gameState.finishLine! * cellSize, width: "100%", height: cellSize, backgroundImage: `repeating-conic-gradient(hsl(var(--surface-200-hsl)) 0% 25%, hsl(var(--border-hsl)) 0% 50%)`, backgroundSize: `${cellSize}px ${cellSize}px`, opacity: 0.8, }} />;
        return [finishLine, ...(trapElements || [])];
      }
      default: return null;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <div
        className="relative bg-surface-100 border border-border rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl transition-transform duration-1000 ease-in-out bg-grid-pattern"
        style={{
          width: boardSize,
          height: boardSize,
          backgroundSize: `${cellSize}px ${cellSize}px`,
          transform: `rotate(${clientRotation}deg)`,
        }}
      >
        {renderGameSpecificElements()}
        {players.map((player) => <PlayerAvatar key={player.id} player={player} cellSize={cellSize} />)}
        {ghosts.map((g) => (
          <GhostAvatar key={g.id} x={g.x} y={g.y} cellSize={cellSize} rotation={-clientRotation} />
        ))}
        {fogOfWarOverlayStyle && <div className="absolute inset-0 pointer-events-none transition-all duration-300 ease-linear z-20" style={fogOfWarOverlayStyle} />}
      </div>
    </div>
  );
};

export default GameBoard;