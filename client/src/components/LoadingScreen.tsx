
import React from 'react';
import Spinner from '@components/Spinner';
import { LogoIcon } from '@components/icons';

const LoadingScreen: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-fade-in">
            <div className="p-4 bg-surface-100 rounded-full mb-4 border border-border animate-bounce-subtle">
                <LogoIcon className="h-16 w-16 text-primary"/>
            </div>
            <Spinner className="w-16 h-16" />
            <p className="text-text-secondary mt-2 animate-fade-in">Loading Pixel Arena...</p>
        </div>
    );
};

export default LoadingScreen;
