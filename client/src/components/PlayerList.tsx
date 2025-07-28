
import React from "react";
import { motion } from "framer-motion";
import type { Player, Room } from "@custom-types/index";
import { GameMode } from "@custom-types/index";
import { INFECTED_COLOR } from "@constants/index";

const PlayerList: React.FC<{ room: Room; user: Omit<Player, "socketId"> }> = ({ room, user }) => {
  return (
    <div className="space-y-2 flex-grow flex flex-col min-h-0">
      <h3 className="font-bold text-lg text-text-primary mb-2 flex-shrink-0">
        Players ({room.players.length}/8)
      </h3>
      <div className="space-y-2 flex-grow overflow-y-auto scrollbar-thin pr-1 max-h-[20dvh] 2xl:max-h-[70vh]">
        {room.players.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 gap-2 ${p.id === user.id ? "bg-surface-200 border-primary" : "bg-surface-100 border-border hover:bg-surface-200"
              } ${p.isEliminated || p.isCaught ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-3 flex-grow min-w-0">
              <div
                className="w-3 h-6 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: p.isInfected ? INFECTED_COLOR : p.color,
                }}
              ></div>
              <span className={`font-semibold text-text-primary truncate ${p.isEliminated || p.isCaught ? "line-through" : ""}`}>
                {p.name}
                {p.id === user.id ? " (You)" : ""}
              </span>
            </div>

            <div className="flex items-center justify-end flex-shrink-0 flex-wrap gap-x-2 gap-y-1 text-xs font-bold">
              {p.id === room.hostId && <span className="bg-warning text-text-on-primary px-2 py-0.5 rounded-full">HOST</span>}
              {p.isIt && <span className="text-error animate-pulse">(It!)</span>}
              {p.isInfected && <span className="animate-pulse" style={{ color: INFECTED_COLOR }}>(Infected)</span>}
              {room.gameMode === GameMode.HIDE_AND_SEEK && (
                <span className={`px-2 py-0.5 rounded-full ${p.isCaught ? "bg-surface-200 text-text-secondary" : p.isSeeker ? "bg-error/50 text-error" : "bg-primary/50 text-primary"}`}>
                  {p.isCaught ? "Caught" : p.isSeeker ? "Seeker" : "Hider"}
                </span>
              )}
              <span className="font-mono text-lg text-text-primary">{p.score}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
