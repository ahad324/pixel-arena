import React from 'react';
import Loader from '@components/Loader';
import Logo from "/logo.svg";
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
    const loadingText = "Loading Pixel Arena...";

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-8">
            {/* Aurora background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 150, delay: 0.1 }}
                className="h-20 w-20 overflow-hidden bg-surface-100 rounded-2xl border border-border"
            >
                <img src={Logo} className="h-full w-full text-text-primary" alt="Pixel Arena Logo" />
            </motion.div>

            <Loader
                className="w-16 h-16"
                text={loadingText}
                containerClassName="flex-col"
                textClassName="text-text-secondary text-lg tracking-wider"
            />
        </div>
    );
};

export default LoadingScreen;