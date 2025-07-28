
import React from "react";
import { GameMode } from "@custom-types/index";
import { GAME_INSTRUCTIONS } from "@constants/index";
import { useDeviceDetection } from "@hooks/useDeviceDetection";
import Modal from "@components/ui/Modal";
import { motion } from "framer-motion";

interface InstructionsModalProps {
  gameMode: GameMode;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ gameMode, onClose }) => {
  const instructions = GAME_INSTRUCTIONS[gameMode];
  const { isMobile } = useDeviceDetection();

  if (!instructions) return null;

  const controlsToShow = isMobile ? instructions.controls.mobile : instructions.controls.desktop;

  const footer = (
    <motion.button
      onClick={onClose}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-primary text-text-on-primary font-bold py-3 rounded-xl focus:outline-none transition-all duration-200"
    >
      Got it!
    </motion.button>
  );

  return (
    <Modal isOpen={true} onClose={onClose} title={instructions.title} footer={footer}>
      <div className="space-y-6">
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
    </Modal>
  );
};

export default InstructionsModal;
