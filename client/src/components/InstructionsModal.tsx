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

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  if (!instructions) {
    return null;
  }

  const controlsToShow = isMobile
    ? instructions.controls.mobile
    : instructions.controls.desktop;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg p-6 md:p-8 shadow-2xl shadow-blue-500/20 max-w-2xl w-full mx-4 text-left transform animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-white">
            {instructions.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 text-3xl hover:text-white transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg text-blue-400 mb-2">Objective</h3>
            <p className="text-gray-300">{instructions.objective}</p>
          </div>

          <div>
            <h3 className="font-bold text-lg text-blue-400 mb-2">Rules</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {instructions.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg text-blue-400 mb-2">Controls</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {controlsToShow.map((control, index) => (
                <li key={index}>{control}</li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transform hover:scale-105 transition-transform duration-200"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default InstructionsModal;