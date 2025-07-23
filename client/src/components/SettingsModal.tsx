
import React from 'react';
import Modal from '@components/ui/Modal';
import Dropdown from '@components/ui/Dropdown';
import { useTheme } from '@contexts/ThemeContext';
import { useGame } from '@contexts/GameContext';
import { motion } from 'framer-motion';
import { LogoutIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { themes, currentTheme, setTheme } = useTheme();
  const { logout } = useGame();

  const themeOptions = themes.map(t => ({ value: t.name, label: t.name }));

  const handleLogout = () => {
    logout();
    onClose();
  };

  const footer = (
    <motion.button
      onClick={handleLogout}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-2 bg-error text-text-on-primary font-bold py-3 rounded-xl shadow-lg hover:bg-error-hover focus:outline-none transition-all duration-200"
    >
      <LogoutIcon className="w-5 h-5" />
      Logout
    </motion.button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" footer={footer}>
      <div className="space-y-6">
        <div>
          <Dropdown
            label="Color Theme"
            options={themeOptions}
            selectedValue={currentTheme?.name || ''}
            onChange={(value) => setTheme(value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
