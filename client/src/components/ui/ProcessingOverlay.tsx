import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@components/Loader';

interface ProcessingOverlayProps {
  isVisible: boolean;
  text?: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ isVisible, text = "Processing..." }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center z-[100]"
        >
          <Loader
            className="w-12 h-12"
            text={text}
            containerClassName="flex-col"
            textClassName="text-text-primary text-lg font-semibold"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingOverlay;