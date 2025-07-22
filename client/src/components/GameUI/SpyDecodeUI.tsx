
import React from "react";
import { motion } from "framer-motion";
import type { Player, Room } from "../../types/index";
import { socketService } from "@services/socketService";

const SpyDecodeUI: React.FC<{ room: Room; user: Omit<Player, "socketId"> }> = ({
  room,
  user,
}) => {
  const { gameState } = room;
  const self = room.players.find((p) => p.id === user.id);

  if (gameState.phase === "reveal") {
    const spy = room.players.find((p) => p.isSpy);
    return (
      <div className="bg-primary/10 text-primary rounded-xl p-4 text-center mb-4 border border-primary/20">
        <h4 className="font-bold">Round Over!</h4>
        <p>The correct code was: <span className="font-bold">{gameState.codes?.find((c) => c.id === gameState.correctCodeId)?.value}</span></p>
        <p>The spy was: <span className="font-bold">{spy?.name}</span></p>
      </div>
    );
  }

  return (
    <div className="bg-surface-200/40 rounded-xl p-4 mb-4 border border-border/30">
      <h4 className="font-bold text-center text-primary mb-2">
        {self?.isSpy ? "You are the SPY!" : "Find the correct code!"}
      </h4>
      {self?.isSpy && (
        <p className="text-center text-xs text-warning mb-2">
          Secret Code: <span className="font-bold tracking-widest">{gameState.codes?.find((c) => c.id === gameState.correctCodeId)?.value}</span>
        </p>
      )}

      {gameState.phase === "guessing" && (
        <div className="grid grid-cols-3 gap-2">
          {gameState.codes?.map((code) => (
            <motion.button
              key={code.id}
              onClick={() => socketService.submitGuess(room.id, user.id, code.id)}
              disabled={!!self?.guess}
              whileHover={{ scale: self?.guess ? 1 : 1.05 }}
              whileTap={{ scale: self?.guess ? 1 : 0.95 }}
              className={`p-2 rounded-md font-bold text-text-on-primary transition-colors ${self?.guess === code.id ? "bg-accent" : "bg-primary/80 hover:bg-primary"} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {code.value}
            </motion.button>
          ))}
        </div>
      )}
      {gameState.phase === "signaling" && (
        <p className="text-center text-xs text-text-secondary">
          {self?.isSpy ? "Signal the code to your allies..." : "Watch the spy for clues..."}
        </p>
      )}
    </div>
  );
};

export default SpyDecodeUI;
