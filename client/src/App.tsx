
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import GameProvider from '@contexts/GameContext';
import RootRouter from '@routes/index';
import { ThemeProvider } from '@contexts/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <GameProvider>
        <BrowserRouter>
          <RootRouter />
        </BrowserRouter>
      </GameProvider>
    </ThemeProvider>
  );
};

export default App;
