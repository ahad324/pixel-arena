import React, { useState, useRef, useEffect } from "react";
import type { Room } from "../types";
import { GameMode } from "../types";
import { GRID_SIZE } from "@constants/index";
import PlayerAvatar from "@components/PlayerAvatar";
import { FreezeIcon, SlowIcon, TeleportIcon } from "@components/icons";

interface GameBoardProps {
  room: Room;
}

const GameBoard: React.FC<GameBoardProps> = ({ room }) => {
  const { players, gameState, gameMode } = room;
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(32);

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

  const boardSize = GRID_SIZE * cellSize;

  const renderGameSpecificElements = () => {
    switch (gameMode) {
      case GameMode.TERRITORY_CONTROL:
        return gameState.tiles?.flat().map((tile, index) =>
          tile.color ? (
            <div
              key={index}
              className="absolute transition-colors duration-500"
              style={{
                left: `${(index % GRID_SIZE) * cellSize}px`,
                top: `${Math.floor(index / GRID_SIZE) * cellSize}px`,
                width: cellSize,
                height: cellSize,
                backgroundColor: tile.color,
                opacity: 0.4,
              }}
            ></div>
          ) : null
        );
      case GameMode.MAZE_RACE:
        return gameState.maze?.grid.map((row, y) =>
          row.map((cell, x) =>
            cell === 1 ? (
              <div
                key={`${x}-${y}`}
                className="absolute bg-gray-600 border border-gray-500"
                style={{
                  left: x * cellSize,
                  top: y * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              ></div>
            ) : gameState.maze?.end &&
              y === gameState.maze.end.y &&
              x === gameState.maze.end.x ? (
              <div
                key="end-point"
                className="absolute bg-green-500/50 rounded-full animate-pulse"
                style={{
                  left: x * cellSize + cellSize / 4,
                  top: y * cellSize + cellSize / 4,
                  width: cellSize / 2,
                  height: cellSize / 2,
                }}
              ></div>
            ) : null
          )
        );
      case GameMode.TRAP_RUSH:
        const trapElements = gameState.trapMap?.flatMap((row, y) =>
          row.map((trap, x) => {
            if (!trap || !trap.revealed) return null;
            const trapIcons = {
              freeze: <FreezeIcon className="w-full h-full text-cyan-400" />,
              slow: <SlowIcon className="w-full h-full text-orange-400" />,
              teleport: (
                <TeleportIcon className="w-full h-full text-purple-400" />
              ),
            };
            return (
              <div
                key={`${x}-${y}`}
                className="absolute p-2"
                style={{
                  left: x * cellSize,
                  top: y * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              >
                <div className="w-full h-full bg-gray-900/50 rounded-full animate-in fade-in">
                  {trapIcons[trap.type]}
                </div>
              </div>
            );
          })
        );
        const finishLine = (
          <div
            key="finish-line"
            className="absolute"
            style={{
              left: 0,
              top: gameState.finishLine! * cellSize,
              width: "100%",
              height: cellSize,
              backgroundImage:
                "repeating-conic-gradient(#1F2937 0% 25%, #4B5563 0% 50%)",
              backgroundSize: `${cellSize}px ${cellSize}px`,
              opacity: 0.8,
            }}
          ></div>
        );
        return [finishLine, ...(trapElements || [])];
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div
        className="relative bg-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden flex-shrink-0"
        style={{
          width: boardSize,
          height: boardSize,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: `${cellSize}px ${cellSize}px`,
        }}
      >
        {renderGameSpecificElements()}
        {players.map((player) => (
          <PlayerAvatar key={player.id} player={player} cellSize={cellSize} />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
