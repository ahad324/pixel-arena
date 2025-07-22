
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import GameProvider from '@contexts/GameContext';
import RootRouter from '@routes/index';

const App: React.FC = () => {
  return (
    <GameProvider>
      <BrowserRouter>
        <RootRouter />
      </BrowserRouter>
    </GameProvider>
  );
};

export default App;