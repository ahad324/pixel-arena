import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameMode } from "@custom-types/index";
import { socketService } from "@services/socketService";
import InstructionsModal from "@components/InstructionsModal";
import { useGame } from "@contexts/GameContext";
import ProcessingOverlay from "@components/ui/ProcessingOverlay";
import ConnectionBanner from "@components/ui/ConnectionBanner";
import SettingsModal from "@components/SettingsModal";
import LobbyHeader from "@components/lobby/LobbyHeader";
import GameModeSelector from "@components/lobby/GameModeSelector";
import LobbyActions from "@components/lobby/LobbyActions";
import AvailableRooms from "@components/lobby/AvailableRooms";

const LobbyPage: React.FC = () => {
  const { user, joinRoom: onJoinRoom, isConnected, connectionError, isConnectionWarningDismissed, dismissConnectionWarning, resetConnectionWarning } = useGame();
  const navigate = useNavigate();
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(GameMode.TAG);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [availableRooms, setAvailableRooms] = useState<{ id: string; gameMode: GameMode; playerCount: number }[]>([]);
  const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState("");
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      setIsProcessing(false);
      setIsLoadingRooms(false);
    } else {
      setIsLoadingRooms(true);
      socketService.getAvailableRooms();
    }
  }, [isConnected]);

  useEffect(() => {
    const handleRoomsUpdate = (rooms: { id: string; gameMode: GameMode; playerCount: number }[]) => {
      setAvailableRooms(rooms);
      setIsLoadingRooms(false);
    };
    socketService.onAvailableRoomsUpdate(handleRoomsUpdate);

    if (isConnected) {
      socketService.getAvailableRooms();
    }

    return () => socketService.offAvailableRoomsUpdate();
  }, [isConnected]);

  const checkConnection = () => {
    if (!isConnected) {
      resetConnectionWarning();
      return false;
    }
    return true;
  };

  const handleCreateRoom = () => {
    if (!checkConnection() || isProcessing || !user) return;
    setIsProcessing(true);
    setProcessingText("Creating Room...");
    socketService.createRoom(user, selectedGameMode, (room) => {
      onJoinRoom(room);
      navigate(`/rooms/${room.id}`);
    });
  };

  const handleJoinWithCode = (code: string) => {
    if (!checkConnection() || !code || isProcessing || !user) return;
    setIsProcessing(true);
    setProcessingText("Joining Room...");
    socketService.joinRoom(code.toUpperCase(), user, ({ room, error }) => {
      if (room) {
        onJoinRoom(room);
        navigate(`/rooms/${room.id}`);
      } else {
        setError(error || "An unknown error occurred.");
        setTimeout(() => setError(""), 3000);
        setIsProcessing(false);
        setProcessingText("");
      }
    });
  };

  return (
    <>
      <ConnectionBanner
        isVisible={!isConnected && !isConnectionWarningDismissed}
        error={connectionError}
        onDismiss={dismissConnectionWarning}
      />
      <ProcessingOverlay isVisible={isProcessing} text={processingText} />
      {isInstructionsVisible && <InstructionsModal gameMode={selectedGameMode} onClose={() => setIsInstructionsVisible(false)} />}
      <SettingsModal isOpen={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} />

      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <LobbyHeader user={user} onSettingsClick={() => setIsSettingsVisible(true)} />

          <GameModeSelector selectedGameMode={selectedGameMode} onSelect={setSelectedGameMode} />

          <LobbyActions
            selectedGameMode={selectedGameMode}
            handleCreateRoom={handleCreateRoom}
            handleJoinWithCode={handleJoinWithCode}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            isProcessing={isProcessing}
            isConnected={isConnected}
            error={error}
            onShowInstructions={() => setIsInstructionsVisible(true)}
          />

          <AvailableRooms
            availableRooms={availableRooms}
            isLoadingRooms={isLoadingRooms}
            isConnected={isConnected}
            handleJoinWithCode={handleJoinWithCode}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </>
  );
};

export default LobbyPage;