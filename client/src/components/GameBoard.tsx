import React from "react";
import type { Room } from "../types";
import { GameMode } from "../types";
import { GRID_SIZE, CELL_SIZE } from "@constants/index";
import PlayerAvatar from "@components/PlayerAvatar";
import { FreezeIcon, SlowIcon, TeleportIcon } from "@components/icons";

interface GameBoardProps {
  room: Room;
}

const GameBoard: React.FC<GameBoardProps> = ({ room }) => {
  const { players, gameState, gameMode } = room;

  const renderGameSpecificElements = () => {
    switch (gameMode) {
      case GameMode.TERRITORY_CONTROL:
        return gameState.tiles?.flat().map((tile, index) =>
          tile.color ? (
            <div
              key={index}
              className="absolute transition-colors duration-500"
              style={{
                left: `${(index % GRID_SIZE) * CELL_SIZE}px`,
                top: `${Math.floor(index / GRID_SIZE) * CELL_SIZE}px`,
                width: CELL_SIZE,
                height: CELL_SIZE,
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
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              ></div>
            ) : gameState.maze?.end &&
              y === gameState.maze.end.y &&
              x === gameState.maze.end.x ? (
              <div
                key="end-point"
                className="absolute bg-green-500/50 rounded-full animate-pulse"
                style={{
                  left: x * CELL_SIZE + CELL_SIZE / 4,
                  top: y * CELL_SIZE + CELL_SIZE / 4,
                  width: CELL_SIZE / 2,
                  height: CELL_SIZE / 2,
                }}
              ></div>
            ) : null
          )
        );
      case GameMode.DODGE_THE_SPIKES:
        return gameState.spikes?.map((spike) => (
          <div
            key={spike.id}
            className="absolute text-red-500 text-center font-black"
            style={{
              left: spike.x * CELL_SIZE,
              top: spike.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              transform: "translateY(-5px)",
              fontSize: `${CELL_SIZE * 0.8}px`,
            }}
          >
            ▼
          </div>
        ));
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
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
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
              top: gameState.finishLine! * CELL_SIZE,
              width: "100%",
              height: CELL_SIZE,
              backgroundImage:
                "repeating-conic-gradient(#1F2937 0% 25%, #4B5563 0% 50%)",
              backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
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
      className="relative bg-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden"
      style={{
        width: GRID_SIZE * CELL_SIZE,
        height: GRID_SIZE * CELL_SIZE,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
      }}
    >
      {renderGameSpecificElements()}
      {players.map((player) => (
        <PlayerAvatar key={player.id} player={player} />
      ))}
    </div>
  );
};

export default GameBoard;