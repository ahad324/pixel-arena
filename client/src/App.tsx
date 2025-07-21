import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import GameProvider, { useGame } from "@contexts/GameContext";
import LandingPage from "@pages/LandingPage";
import LoginPage from "@pages/LoginPage";
import LobbyPage from "@pages/LobbyPage";
import GamePage from "@pages/GamePage";
import LoadingScreen from "@components/LoadingScreen";
import MaintenancePage from "@pages/MaintenancePage";

// --- MAINTENANCE MODE TOGGLE ---
// Set this to true to enable the maintenance/coming soon page for all routes.
const IS_MAINTENANCE_MODE = true;

const AppRoutes: React.FC = () => {
  const { user, room, isLoading } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (IS_MAINTENANCE_MODE) return;

    // This effect synchronizes the URL with the global game context (e.g., if a user is in a room).
    // The primary authentication routing is handled declaratively in the <Routes> below.
    if (isLoading || !user) {
      return; // Only run these checks if logged in and not loading.
    }

    const currentPath = location.pathname;

    // If the user has a room in their context, they must be on that room's URL.
    if (room && currentPath !== `/rooms/${room.id}`) {
      navigate(`/rooms/${room.id}`);
    }
    // If the user is on a room URL but has no room in their context, redirect them to the lobby.
    else if (!room && currentPath.startsWith('/rooms')) {
      navigate('/lobby');
    }
  }, [user, room, isLoading, navigate, location.pathname]);

  if (IS_MAINTENANCE_MODE) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Launch at 9:00 AM tomorrow.

    return (
      <Routes>
        <Route
          path="*"
          element={
            <MaintenancePage
              title="Launching Soon"
              message="Our arena is getting polished for an epic launch. Get ready for the action!"
              launchDate={tomorrow}
            />
          }
        />
      </Routes>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/lobby" /> : <LoginPage />} />
      <Route path="/lobby" element={!user ? <Navigate to="/login" /> : <LobbyPage />} />
      <Route path="/rooms/:id" element={!user ? <Navigate to="/login" /> : <GamePage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </GameProvider>
  );
};

export default App;
