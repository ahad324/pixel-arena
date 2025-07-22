
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import GameProvider from '@contexts/GameContext';
import RootRouter from '@routes/index';
import MainLayout from '@layouts/MainLayout';

const App: React.FC = () => {
  return (
    <GameProvider>
      <BrowserRouter>
        <MainLayout>
          <RootRouter />
        </MainLayout>
      </BrowserRouter>
    </GameProvider>
  );
};

export default App;