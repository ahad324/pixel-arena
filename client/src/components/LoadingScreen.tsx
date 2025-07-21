import React from 'react';
import Spinner from '@components/Spinner';
import logo from "/logo.svg";

const LoadingScreen: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-fade-in">
            <div className="h-20 w-20 rounded-full overflow-hidden mb-4 border border-border bg-surface-100 animate-bounce-subtle">
                <img src={logo} className="w-full h-full object-cover" alt="Logo" />
            </div>
            <Spinner className="w-16 h-16" />
            <p className="text-text-secondary mt-2 animate-fade-in">Loading Pixel Arena...</p>
        </div>
    );
};

export default LoadingScreen;
