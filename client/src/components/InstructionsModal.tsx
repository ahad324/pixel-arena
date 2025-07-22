
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameMode } from "../types";
import { GAME_INSTRUCTIONS } from "@constants/index";
import { useDeviceDetection } from "@hooks/useDeviceDetection";

interface InstructionsModalProps {
  gameMode: GameMode;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ gameMode, onClose }) => {
  const instructions = GAME_INSTRUCTIONS[gameMode];
  const { isMobile } = useDeviceDetection();

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!instructions) return null;

  const controlsToShow = isMobile ? instructions.controls.mobile : instructions.controls.desktop;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-surface-100 border border-border rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-border text-center">
            <h2 className="text-3xl text-text-primary">{instructions.title}</h2>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin">
            <div>
              <h3 className="font-bold text-lg text-primary mb-2">Objective</h3>
              <p className="text-text-secondary">{instructions.objective}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-accent mb-2">Rules</h3>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                {instructions.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg text-warning mb-2">Controls</h3>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                {controlsToShow.map((control, index) => (
                  <li key={index}>{control}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="p-6 border-t border-border">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-text-on-primary font-bold py-3 rounded-xl focus:outline-none transition-all duration-200"
            >
              Got it!
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InstructionsModal;
