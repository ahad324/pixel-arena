import React from 'react';
import Spinner from '@components/Spinner';
import { LogoIcon } from '@components/icons';

const LoadingScreen: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
            <div className="p-4 bg-gray-900 rounded-full mb-4 border border-gray-700">
                <LogoIcon className="h-16 w-16 text-blue-500 animate-pulse"/>
            </div>
            <Spinner className="w-16 h-16" />
            <p className="text-gray-400 mt-2">Loading Pixel Arena...</p>
        </div>
    );
};

export default LoadingScreen;