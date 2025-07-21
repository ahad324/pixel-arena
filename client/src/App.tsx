
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import GameProvider, { useGame } from "@contexts/GameContext";
import LandingPage from "@pages/LandingPage";
import LoginPage from "@pages/LoginPage";
import LobbyPage from "@pages/LobbyPage";
import GamePage from "@pages/GamePage";
import LoadingScreen from "@components/LoadingScreen";
import MaintenancePage from "@pages/MaintenancePage";

const LAUNCH_TIMESTAMP = 1753171200000;

const LAUNCH_DATE = new Date(LAUNCH_TIMESTAMP);

const AppRoutes: React.FC = () => {
  const { user, room, isLoading } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLive, setIsLive] = useState(() => Date.now() >= LAUNCH_TIMESTAMP);

  useEffect(() => {
    // If the app is already live, we don't need a timer.
    if (isLive) return;

    // This timer checks every second if the launch time has been reached.
    const timer = setInterval(() => {
      if (Date.now() >= LAUNCH_TIMESTAMP) {
        setIsLive(true);
        clearInterval(timer);
      }
    }, 1000);

    // Clean up the timer when the component unmounts.
    return () => clearInterval(timer);
  }, [isLive]);

  // This effect handles in-app navigation logic.
  useEffect(() => {
    // We only run navigation logic if the app is live and the user is logged in.
    if (!isLive || isLoading || !user) {
      return;
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
  }, [user, room, isLoading, navigate, location.pathname, isLive]);

  if (!isLive) {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <MaintenancePage
              title="Launching Soon"
              message="Our arena is getting polished for an epic launch. Get ready for the action!"
              launchDate={LAUNCH_DATE}
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
