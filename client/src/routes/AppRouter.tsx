
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useGame } from "@contexts/GameContext";
import LandingPage from "@pages/LandingPage";
import LoginPage from "@pages/LoginPage";
import LobbyPage from "@pages/LobbyPage";
import GamePage from "@pages/GamePage";
import LoadingScreen from "@components/LoadingScreen";

const AppRouter: React.FC = () => {
  const { user, room, isLoading } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  // This effect handles in-app navigation logic.
  useEffect(() => {
    if (isLoading || !user) {
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
  }, [user, room, isLoading, navigate, location.pathname]);

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

export default AppRouter;
