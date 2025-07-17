import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameProvider, { useGame } from "@contexts/GameContext";
import LoginPage from "@pages/LoginPage";
import LobbyPage from "@pages/LobbyPage";
import GamePage from "@pages/GamePage";
import LoadingScreen from "@components/LoadingScreen";

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.2,
};

const AppContent: React.FC = () => {
  const { user, room, isLoading } = useGame();

  const getPageKey = () => {
    if (isLoading) return "loading";
    if (!user) return "login";
    if (!room) return "lobby";
    return "game";
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingScreen />;
    }
    if (!user) {
      return <LoginPage />;
    }
    if (!room) {
      return <LobbyPage />;
    }
    return <GamePage />;
  };

  return (
    <main className="bg-gray-900 flex flex-col items-center justify-center p-4 font-mono w-full min-h-screen">
      <div className="w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={getPageKey()}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
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