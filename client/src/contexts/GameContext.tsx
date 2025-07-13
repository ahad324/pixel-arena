import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import type { Player, Room } from "../types";
import { socketService } from "@services/socketService";

interface GameContextType {
  user: Omit<Player, "socketId"> | null;
  room: Room | null;
  isLoading: boolean;
  login: (username: string) => void;
  joinRoom: (room: Room) => void;
  leaveRoom: () => void;
  endGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Omit<Player, "socketId"> | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUsername = localStorage.getItem("pixel-arena-username");
    if (savedUsername) {
      setUser({
        id: crypto.randomUUID(),
        name: savedUsername,
        x: 0,
        y: 0,
        score: 0,
        color: "",
        isIt: false,
        isEliminated: false,
      });
    }

    socketService.connect();

    const handleRoomUpdate = (updatedRoom: Room) => {
      setRoom(updatedRoom);
    };

    socketService.onRoomUpdate(handleRoomUpdate);
    setIsLoading(false);

    return () => {
      socketService.disconnect();
      socketService.offRoomUpdate();
    };
  }, []);

  const login = (username: string) => {
    const newUser: Omit<Player, "socketId"> = {
      id: crypto.randomUUID(),
      name: username,
      x: 0,
      y: 0,
      score: 0,
      color: "",
      isIt: false,
      isEliminated: false,
    };
    localStorage.setItem("pixel-arena-username", username);
    setUser(newUser);
  };

  const joinRoom = (joinedRoom: Room) => {
    setRoom(joinedRoom);
  };

  const leaveRoom = () => {
    if (room && user) {
      socketService.leaveRoom(room.id, user.id);
    }
    setRoom(null);
  };

  const endGame = () => {
    setRoom(null);
  };

  const value = {
    user,
    room,
    isLoading,
    login,
    joinRoom,
    leaveRoom,
    endGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;
