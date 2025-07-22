
import React, { createContext, useEffect, useContext, useReducer } from "react";
import type { Player, Room, Footprint } from "../types";
import { GameMode } from "../types";
import { socketService } from "@services/socketService";

interface GameContextType {
  user: Omit<Player, "socketId"> | null;
  room: Room | null;
  isLoading: boolean;
  isConnected: boolean;
  connectionError: string | null;
  isConnectionWarningDismissed: boolean;
  login: (username: string) => void;
  joinRoom: (room: Room) => void;
  leaveRoom: () => void;
  endGame: () => void;
  logout: () => void;
  dismissConnectionWarning: () => void;
  resetConnectionWarning: () => void;
  heistPadFeedback: { [padId: string]: 'correct' | 'incorrect' };
  revealedHidersUntil: number | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction =
  | { type: "SET_IS_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: Omit<Player, "socketId"> | null }
  | { type: "SET_ROOM"; payload: Room | null }
  | { type: "SET_CONNECTION_STATUS"; payload: boolean }
  | { type: "SET_CONNECTION_ERROR"; payload: string | null }
  | { type: "DISMISS_CONNECTION_WARNING" }
  | { type: "RESET_CONNECTION_WARNING" }
  | { type: "PLAYER_JOINED"; payload: Player }
  | { type: "PLAYER_LEFT"; payload: { playerId: string } }
  | { type: "HOST_CHANGED"; payload: { newHostId: string } }
  | {
    type: "GAME_MODE_CHANGED";
    payload: { gameMode: Room["gameMode"]; gameState: Room["gameState"] };
  }
  | { type: "GAME_STARTED"; payload: { room: Room } }
  | {
    type: "PLAYER_MOVED";
    payload: { playerId: string; x: number; y: number };
  }
  | { type: "PLAYER_TAGGED"; payload: { oldIt: string; newIt: string } }
  | {
    type: "TILE_CLAIMED";
    payload: { x: number; y: number; playerId: string; color: string };
  }
  | { type: "PLAYER_INFECTED"; payload: { playerId: string } }
  | {
    type: "ABILITY_ACTIVATED";
    payload: {
      playerId: string;
      ability: "sprint" | "shield" | "reveal";
      expires: number;
    };
  }
  | { type: "TRAP_TRIGGERED"; payload: { x: number; y: number; type: string } }
  | {
    type: "PLAYER_EFFECT";
    payload: { playerId: string; type: "frozen" | "slow"; expires: number };
  }
  | { type: "PAD_GUESSED"; payload: { padId: string; correct: boolean } }
  | { type: "CLEAR_PAD_FEEDBACK"; payload: { padId: string } }
  | { type: "TIMER_UPDATE"; payload: { time: number } }
  | {
    type: "SCORES_UPDATE";
    payload: { scores: { id: string; score: number }[] };
  }
  | {
    type: "PHASE_CHANGED";
    payload: { phase: Room["gameState"]["phase"]; timer: number };
  }
  | { type: "PLAYER_GUESSED"; payload: { playerId: string; guess: string } }
  | { type: "GAME_OVER"; payload: { winner: Player | { name: string } | null; players: Player[] } }
  // Hide and Seek Actions
  | { type: "PLAYER_CAUGHT"; payload: { playerId: string } }
  | { type: "PLAYER_CONVERTED"; payload: { playerId: string } }
  | { type: "FOOTPRINTS_UPDATE"; payload: { footprints: Footprint[] } }
  | { type: "HIDERS_REVEALED"; payload: { duration: number } };

interface GameState {
  user: Omit<Player, "socketId"> | null;
  room: Room | null;
  isLoading: boolean;
  isConnected: boolean;
  connectionError: string | null;
  isConnectionWarningDismissed: boolean;
  heistPadFeedback: { [padId: string]: 'correct' | 'incorrect' };
  revealedHidersUntil: number | null;
}

const initialState: GameState = {
  user: null,
  room: null,
  isLoading: true,
  isConnected: true,
  connectionError: null,
  isConnectionWarningDismissed: false,
  heistPadFeedback: {},
  revealedHidersUntil: null,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SET_IS_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_ROOM":
      return { ...state, room: action.payload };
    case "SET_CONNECTION_STATUS":
      if (action.payload) { // If connected
        return { ...state, isConnected: true, connectionError: null, isConnectionWarningDismissed: false };
      }
      // If disconnected
      return { ...state, isConnected: false };
    case "SET_CONNECTION_ERROR":
      return { ...state, isConnected: false, connectionError: action.payload, isConnectionWarningDismissed: false };
    case "DISMISS_CONNECTION_WARNING":
        return { ...state, isConnectionWarningDismissed: true };
    case "RESET_CONNECTION_WARNING":
        return { ...state, isConnectionWarningDismissed: false };
    case "PLAYER_JOINED":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: [...state.room.players, action.payload],
        },
      };
    case "PLAYER_LEFT":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: state.room.players.filter(
            (p) => p.id !== action.payload.playerId
          ),
        },
      };
    case "HOST_CHANGED":
      if (!state.room) return state;
      return {
        ...state,
        room: { ...state.room, hostId: action.payload.newHostId },
      };
    case "GAME_MODE_CHANGED":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          gameMode: action.payload.gameMode,
          gameState: action.payload.gameState,
        },
      };
    case "GAME_STARTED":
      return { ...state, room: action.payload.room, revealedHidersUntil: null };
    case "PLAYER_MOVED":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: state.room.players.map((p) =>
            p.id === action.payload.playerId
              ? { ...p, x: action.payload.x, y: action.payload.y }
              : p
          ),
        },
      };
    case "PLAYER_TAGGED":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: state.room.players.map((p) => {
            if (p.id === action.payload.oldIt) return { ...p, isIt: false };
            if (p.id === action.payload.newIt) return { ...p, isIt: true };
            return p;
          }),
        },
      };
    case "TILE_CLAIMED": {
      if (!state.room || !state.room.gameState.tiles) return state;
      const newTiles = state.room.gameState.tiles.map((row) => [...row]);
      newTiles[action.payload.y][action.payload.x] = {
        claimedBy: action.payload.playerId,
        color: action.payload.color,
      };
      return {
        ...state,
        room: {
          ...state.room,
          gameState: { ...state.room.gameState, tiles: newTiles },
        },
      };
    }
    case "TIMER_UPDATE":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          gameState: { ...state.room.gameState, timer: action.payload.time },
        },
      };
    case "GAME_OVER":
      if (!state.room) return state;
      let finalPlayers = action.payload.players;
      if (state.room.gameMode === GameMode.HIDE_AND_SEEK) {
        const winnerName = action.payload.winner?.name;
        if (winnerName === "Hider Team") {
          finalPlayers = action.payload.players.filter(p => !p.isSeeker && !p.isCaught);
        } else if (winnerName === "Seeker Team") {
          finalPlayers = action.payload.players.filter(p => p.isSeeker || p.isCaught);
        }
      }
      return {
        ...state,
        room: {
          ...state.room,
          gameState: {
            ...state.room.gameState,
            status: "finished",
            winner: action.payload.winner,
          },
          players: finalPlayers,
        },
        revealedHidersUntil: null,
      };
    case "PLAYER_INFECTED":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: state.room.players.map((p) =>
            p.id === action.payload.playerId ? { ...p, isInfected: true } : p
          ),
        },
      };
    case "ABILITY_ACTIVATED":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: state.room.players.map((p) => {
            if (p.id === action.payload.playerId) {
              if (action.payload.ability === "sprint")
                return { ...p, sprintUntil: action.payload.expires, lastSprintTime: Date.now() };
              if (action.payload.ability === "shield")
                return { ...p, shieldUntil: action.payload.expires, lastShieldTime: Date.now() };
              if (action.payload.ability === "reveal")
                return { ...p, lastRevealTime: Date.now() };
            }
            return p;
          }),
        },
      };
    case "TRAP_TRIGGERED": {
      if (!state.room || !state.room.gameState.trapMap) return state;
      const newTrapMap = state.room.gameState.trapMap.map((r) =>
        r.map((c) => (c ? { ...c } : null))
      );
      if (newTrapMap[action.payload.y][action.payload.x]) {
        newTrapMap[action.payload.y][action.payload.x]!.revealed = true;
      }
      return {
        ...state,
        room: {
          ...state.room,
          gameState: { ...state.room.gameState, trapMap: newTrapMap },
        },
      };
    }
    case "PLAYER_EFFECT":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: state.room.players.map((p) => {
            if (p.id === action.payload.playerId) {
              const newEffects = [...(p.effects || []), { type: action.payload.type, expires: action.payload.expires },];
              return { ...p, effects: newEffects };
            }
            return p;
          }),
        },
      };
    case "SCORES_UPDATE":
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: state.room.players.map((p) => {
            const update = action.payload.scores.find((s) => s.id === p.id);
            return update ? { ...p, score: update.score } : p;
          }),
        },
      };
    case "PAD_GUESSED":
      if (!state.room || state.room.gameMode !== GameMode.HEIST_PANIC) return state;
      return { ...state, heistPadFeedback: { ...state.heistPadFeedback, [action.payload.padId]: action.payload.correct ? 'correct' : 'incorrect' } };
    case "CLEAR_PAD_FEEDBACK": {
      const newFeedback = { ...state.heistPadFeedback };
      delete newFeedback[action.payload.padId];
      return { ...state, heistPadFeedback: newFeedback };
    }
    case "PHASE_CHANGED":
      if (!state.room) return state;
      return { ...state, room: { ...state.room, gameState: { ...state.room.gameState, phase: action.payload.phase, timer: action.payload.timer, }, }, };
    case "PLAYER_GUESSED":
      if (!state.room) return state;
      return { ...state, room: { ...state.room, players: state.room.players.map((p) => p.id === action.payload.playerId ? { ...p, guess: action.payload.guess } : p), }, };
    // Hide and Seek Reducers
    case "PLAYER_CAUGHT":
      if (!state.room) return state;
      return { ...state, room: { ...state.room, players: state.room.players.map(p => p.id === action.payload.playerId ? { ...p, isCaught: true } : p) } };
    case "PLAYER_CONVERTED":
      if (!state.room) return state;
      return { ...state, room: { ...state.room, players: state.room.players.map(p => p.id === action.payload.playerId ? { ...p, isCaught: false, isSeeker: true } : p) } };
    case "FOOTPRINTS_UPDATE":
      if (!state.room) return state;
      return { ...state, room: { ...state.room, gameState: { ...state.room.gameState, footprints: action.payload.footprints } } };
    case "HIDERS_REVEALED":
      return { ...state, revealedHidersUntil: Date.now() + action.payload.duration };
    default:
      return state;
  }
};

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    socketService.connect();

    const savedUsername = localStorage.getItem("pixel-arena-username");
    if (savedUsername) {
      dispatch({ type: "SET_USER", payload: { id: crypto.randomUUID(), name: savedUsername, x: 0, y: 0, score: 0, color: "", isIt: false, isEliminated: false, }, });
    }
    dispatch({ type: "SET_IS_LOADING", payload: false });

    // Setup all listeners
    socketService.onConnect(() => dispatch({ type: "SET_CONNECTION_STATUS", payload: true }));
    socketService.onDisconnect(() => dispatch({ type: "SET_CONNECTION_STATUS", payload: false }));
    socketService.onConnectError((err) => {
        console.error("Connection Error:", err.message);
        dispatch({ type: "SET_CONNECTION_ERROR", payload: "Cannot connect to Pixel Arena servers. The server may be down for maintenance or there could be an issue with your network." });
    });
    
    socketService.onGameStarted((data) => dispatch({ type: "GAME_STARTED", payload: data }));
    socketService.onPlayerJoined((data) => dispatch({ type: "PLAYER_JOINED", payload: data.player }));
    socketService.onPlayerLeft((data) => dispatch({ type: "PLAYER_LEFT", payload: data }));
    socketService.onHostChanged((data) => dispatch({ type: "HOST_CHANGED", payload: data }));
    socketService.onGameModeChanged((data) => dispatch({ type: "GAME_MODE_CHANGED", payload: data }));
    socketService.onPlayerMoved((data) => dispatch({ type: "PLAYER_MOVED", payload: data }));
    socketService.onPlayerTagged((data) => dispatch({ type: "PLAYER_TAGGED", payload: data }));
    socketService.onTileClaimed((data) => dispatch({ type: "TILE_CLAIMED", payload: data }));
    socketService.onPlayerInfected((data) => dispatch({ type: "PLAYER_INFECTED", payload: data }));
    socketService.onAbilityActivated((data) => dispatch({ type: "ABILITY_ACTIVATED", payload: data }));
    socketService.onTrapTriggered((data) => dispatch({ type: "TRAP_TRIGGERED", payload: data }));
    socketService.onPlayerEffect((data) => dispatch({ type: "PLAYER_EFFECT", payload: data }));
    socketService.onPadGuessed((data) => {
      dispatch({ type: "PAD_GUESSED", payload: data });
      if (!data.correct) {
        setTimeout(() => {
          dispatch({ type: "CLEAR_PAD_FEEDBACK", payload: { padId: data.padId } });
        }, 1000);
      }
    });
    socketService.onTimerUpdate((data) => dispatch({ type: "TIMER_UPDATE", payload: data }));
    socketService.onScoresUpdate((data) => dispatch({ type: "SCORES_UPDATE", payload: data }));
    socketService.onPhaseChanged((data) => dispatch({ type: "PHASE_CHANGED", payload: data }));
    socketService.onPlayerGuessed((data) => dispatch({ type: "PLAYER_GUESSED", payload: data }));
    socketService.onGameOver((data) => dispatch({ type: "GAME_OVER", payload: data }));

    // Hide and Seek Listeners
    socketService.onPlayerCaught((data) => dispatch({ type: "PLAYER_CAUGHT", payload: data }));
    socketService.onPlayerConverted((data) => dispatch({ type: "PLAYER_CONVERTED", payload: data }));
    socketService.onFootprintsUpdate((data) => dispatch({ type: "FOOTPRINTS_UPDATE", payload: data }));
    socketService.onHidersRevealed((data) => dispatch({ type: "HIDERS_REVEALED", payload: data }));

    return () => {
      socketService.disconnect();
      socketService.offAll();
    };
  }, []);

  const login = (username: string) => {
    const newUser: Omit<Player, "socketId"> = { id: crypto.randomUUID(), name: username, x: 0, y: 0, score: 0, color: "", isIt: false, isEliminated: false, };
    localStorage.setItem("pixel-arena-username", username);
    dispatch({ type: "SET_USER", payload: newUser });
  };

  const joinRoom = (joinedRoom: Room) => {
    dispatch({ type: "SET_ROOM", payload: joinedRoom });
  };

  const leaveRoom = () => {
    socketService.leaveRoom();
    dispatch({ type: "SET_ROOM", payload: null });
  };

  const endGame = () => {
    dispatch({ type: "SET_ROOM", payload: null });
  };

  const logout = () => {
    dispatch({ type: "SET_USER", payload: null });
    localStorage.removeItem("pixel-arena-username");
    leaveRoom();
  };

  const dismissConnectionWarning = () => dispatch({ type: "DISMISS_CONNECTION_WARNING" });
  const resetConnectionWarning = () => dispatch({ type: "RESET_CONNECTION_WARNING" });

  const value: GameContextType = { 
      user: state.user, 
      room: state.room, 
      isLoading: state.isLoading,
      isConnected: state.isConnected,
      connectionError: state.connectionError,
      isConnectionWarningDismissed: state.isConnectionWarningDismissed,
      login, 
      joinRoom, 
      leaveRoom, 
      endGame, 
      dismissConnectionWarning,
      resetConnectionWarning,
      heistPadFeedback: state.heistPadFeedback, 
      revealedHidersUntil: state.revealedHidersUntil, 
      logout,
    };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export default GameProvider;
