import React, { useEffect } from "react";
import { GameMode } from "../types";
import { GAME_INSTRUCTIONS } from "@constants/index";
import { useDeviceDetection } from "@hooks/useDeviceDetection";

interface InstructionsModalProps {
  gameMode: GameMode;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  gameMode,
  onClose,
}) => {
  const instructions = GAME_INSTRUCTIONS[gameMode];
  const { isMobile } = useDeviceDetection();

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!instructions) {
    return null;
  }

  const controlsToShow = isMobile
    ? instructions.controls.mobile
    : instructions.controls.desktop;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div
        className={`bg-surface-100 border border-border rounded-lg shadow-2xl shadow-primary/20 w-full max-w-[90vw] sm:max-w-lg md:max-w-xl mx-4 
          ${isMobile ? 'max-h-[80vh]' : 'max-h-[90vh]'} flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-2xl font-bold text-text-primary">{instructions.title}</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary focus:outline-none transition-colors p-2"
            aria-label="Close Instructions"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-surface-200">
          <div className="space-y-4 text-text-primary">
            <div>
              <h3 className="font-bold text-lg text-primary mb-2">Objective</h3>
              <p className="text-text-secondary">{instructions.objective}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary mb-2">Rules</h3>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                {instructions.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary mb-2">Controls</h3>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                {controlsToShow.map((control, index) => (
                  <li key={index}>{control}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-md focus:outline-none transition-all duration-200 hover:scale-105"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;