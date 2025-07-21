
import React from "react";
import { motion } from "framer-motion";
import { GameMode } from "../types";
import { GAME_DESCRIPTIONS } from "@constants/index";
import type { GameStatus } from "@constants/index";
import { StatusBadge } from "@components/StatusBadge";

interface GameModeCardProps {
  mode: GameMode;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  status?: GameStatus | null;
}

const GameModeCard: React.FC<GameModeCardProps> = ({ mode, icon, selected, onSelect, status }) => {
  const glowColor = selected ? 'theme(colors.primary.DEFAULT)' : 'theme(colors.border)';
  
  return (
    <div className="relative h-full">
      <motion.button
        onClick={onSelect}
        whileHover="hover"
        animate={selected ? "selected" : "initial"}
        className="relative p-0.5 rounded-xl text-left transition-all duration-300 w-full h-full bg-surface-100 border border-transparent"
        style={{
           backgroundImage: `radial-gradient(circle at 1px 1px, ${glowColor} 1px, transparent 0)`,
           backgroundSize: '20px 20px',
        }}
      >
        <div className="absolute -inset-px rounded-xl group-hover:opacity-100 transition-opacity duration-300" 
             style={{
                background: selected ? `radial-gradient(400px at 50% 50%, ${glowColor} 0%, transparent 80%)` : `radial-gradient(400px at 50% 50%, hsla(var(--border-hsl), 0.4) 0%, transparent 80%)`,
                opacity: selected ? 0.3 : 0
            }}
        />

        <div className={`relative w-full h-full bg-surface-100 rounded-lg p-4 sm:p-5 flex flex-col transition-all duration-300 border ${selected ? 'border-primary/50' : 'border-transparent'}`}>
            <div className="flex items-center mb-3">
              <div className="text-primary">
                {icon}
              </div>
              <h3 className="text-lg font-bold ml-3 text-text-primary">{mode}</h3>
            </div>
            <p className="text-sm text-text-secondary flex-grow leading-relaxed">{GAME_DESCRIPTIONS[mode]}</p>
        </div>

      </motion.button>
      {status && <StatusBadge status={status} />}
    </div>
  );
};

export default GameModeCard;
