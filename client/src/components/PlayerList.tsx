

import React from "react";
import type { Player, Room } from "../types/index";
import { GameMode } from "../types/index";
import { PLAYER_COLORS, INFECTED_COLOR } from "@constants/index";

const PlayerList: React.FC<{ room: Room; user: Omit<Player, "socketId"> }> = ({ room, user }) => {
  return (
    <div className="space-y-2 flex-grow mb-4">
      <h3 className="font-bold mb-2 text-lg text-text-primary">
        Players ({room.players.length}/{PLAYER_COLORS.length})
      </h3>
      {room.players.map((p) => (
        <div
          key={p.id}
          className={`p-2 rounded-md flex items-center justify-between text-sm transition-all duration-300 ${p.isEliminated || p.isCaught
            ? "bg-surface-200/50 text-text-secondary/50 line-through"
            : "bg-surface-200"
            }`}
        >
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-3"
              style={{
                backgroundColor: p.isInfected ? INFECTED_COLOR : p.color,
              }}
            ></div>
            <span className="font-bold text-text-primary">
              {p.name}
              {p.id === user.id ? " (You)" : ""}
              {p.id === room.hostId ? " 👑" : ""}
            </span>
            {p.isIt && (
              <span className="ml-2 text-error font-bold animate-pulse">
                (It!)
              </span>
            )}
            {p.isInfected && (
              <span className="ml-2 font-bold animate-pulse" style={{ color: INFECTED_COLOR }}>
                (Infected)
              </span>
            )}
            {room.gameMode === GameMode.HIDE_AND_SEEK && (
              <span className="ml-2 font-semibold">
                {p.isCaught ? (
                  <span className="text-text-secondary">(Caught)</span>
                ) : p.isSeeker ? (
                  <span className="text-error">(Seeker)</span>
                ) : (
                  <span className="text-primary">(Hider)</span>
                )}
              </span>
            )}
          </div>
          <span className="font-mono font-bold text-lg text-primary">
            {p.score}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PlayerList;