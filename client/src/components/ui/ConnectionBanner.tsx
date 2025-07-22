import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@components/Loader';
import { XIcon, AlertTriangleIcon } from '@components/icons';

interface ConnectionBannerProps {
  isVisible: boolean;
  error: string | null;
  onDismiss: () => void;
}

const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ isVisible, error, onDismiss }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[100] max-w-md mx-auto sm:mx-0"
          role="alert"
        >
          <div className="relative bg-surface-100 border border-border rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="flex-shrink-0">
                {error ? (
                  <div className="w-10 h-10 rounded-full bg-error/20 border-2 border-error/50 flex items-center justify-center">
                    <AlertTriangleIcon className="w-6 h-6 text-error" />
                  </div>
                ) : (
                  <Loader className="w-8 h-8" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-text-primary">
                  {error ? 'Connection Lost' : 'Reconnecting...'}
                </h3>
                <p className="text-sm text-text-secondary">
                  {error || 'Attempting to reconnect to the server.'}
                </p>
              </div>
            </div>
            {error && (
              <button
                onClick={onDismiss}
                aria-label="Dismiss"
                className="absolute top-2 right-2 p-2 rounded-full text-text-secondary hover:bg-surface-200 hover:text-text-primary transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionBanner;
