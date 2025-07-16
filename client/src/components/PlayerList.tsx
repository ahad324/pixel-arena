import React from "react";
import type { Player, Room } from "../types/index";
import { PLAYER_COLORS, INFECTED_COLOR } from "@constants/index";

const PlayerList: React.FC<{ room: Room; user: Omit<Player, "socketId"> }> = ({ room, user }) => {
  return (
    <div className="space-y-2 flex-grow mb-4">
      <h3 className="font-bold mb-2 text-lg">
        Players ({room.players.length}/{PLAYER_COLORS.length})
      </h3>
      {room.players.map((p) => (
        <div
          key={p.id}
          className={`p-2 rounded-md flex items-center justify-between text-sm ${p.isEliminated
              ? "bg-gray-700 text-gray-500 line-through"
              : "bg-gray-700"
            }`}
        >
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-3"
              style={{
                backgroundColor: p.isInfected ? INFECTED_COLOR : p.color,
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
  );
};

export default PlayerList;