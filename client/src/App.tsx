import React from "react";
import GameProvider, { useGame } from "@contexts/GameContext";
import LoginPage from "@pages/LoginPage";
import LobbyPage from "@pages/LobbyPage";
import GamePage from "@pages/GamePage";
import LoadingScreen from "@components/LoadingScreen";

const AppContent: React.FC = () => {
  const { user, room, isLoading } = useGame();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="animate-fade-in">
          <LoadingScreen />
        </div>
      );
    }
    if (!user) {
      return (
        <div className="animate-fade-in">
          <LoginPage />
        </div>
      );
    }
    if (!room) {
      return (
        <div className="animate-fade-in">
          <LobbyPage />
        </div>
      );
    }
    return (
      <div className="animate-fade-in">
        <GamePage />
      </div>
    );
  };

  return (
    <main className="bg-gray-900 flex flex-col items-center justify-center p-4 font-mono w-full min-h-screen">
      <div className="w-full max-w-7xl mx-auto">{renderContent()}</div>
    </main>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;