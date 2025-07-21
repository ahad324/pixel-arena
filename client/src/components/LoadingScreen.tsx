
import React from 'react';
import Spinner from '@components/Spinner';
import Logo from "/logo.svg"
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 150, delay: 0.1 }}
                className="h-20 w-20 overflow-hidden bg-surface-100 rounded-2xl mb-4 border border-border"
            >
                <img src={Logo} className="h-full w-full text-text-primary"/>
            </motion.div>
            <Spinner className="w-12 h-12" />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-text-secondary mt-2"
            >
              Loading Pixel Arena...
            </motion.p>
        </div>
    );
};

export default LoadingScreen;
