# ⚙️ Pixel Arena - Server

This directory contains the backend server for the Pixel Arena application. It is built with Node.js, Express, and TypeScript, and it uses Socket.IO to manage real-time, stateful multiplayer game logic.

## ✨ Core Functionality

- **WebSocket Handling:** Manages all real-time communication via Socket.IO.
- **State Management:** The `GameService` class holds the in-memory state of all active rooms, players, and game sessions.
- **Game Logic:** Implements the rules, scoring, and state transitions for all available game modes.
- **Room Management:** Handles the creation, joining, and leaving of game rooms.

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Communication:** [Socket.IO](https://socket.io/)
- **Development:** [ts-node-dev](https://github.com/wclr/ts-node-dev) for live-reloading.

## 📂 Folder Structure

The `src/` directory is organized as follows:

```
src/
├── config/         # Game constants and settings (e.g., grid size, game timers)
├── services/       # Core logic services, primarily `gameService.ts` which is the game engine
├── sockets/        # Socket.IO event listeners and emitters, connecting client actions to game logic
├── types/          # Shared TypeScript type definitions for the server
├── utils/          # Utility functions (e.g., `mazeGenerator.ts`)
├── app.ts          # Express app configuration (CORS, basic routes)
└── index.ts        # Server entry point, initializes the HTTP server and Socket.IO instance
```

## 📡 WebSocket API

The server listens for and emits the following primary Socket.IO events:

| Event Name                 | Direction | Description                                                            |
| -------------------------- | --------- | ---------------------------------------------------------------------- |
| `get-available-rooms`    | Client → | Asks the server for a list of joinable rooms.                          |
| `available-rooms-update` | Server → | Sends the updated list of available rooms to all clients.              |
| `create-room`            | Client → | Creates a new game room with the specified host and game mode.         |
| `join-room`              | Client → | Allows a player to join an existing room using a room code.            |
| `room-update`            | Server → | Sends the complete, updated state of a room to all players within it.  |
| `set-game-mode`          | Client → | Allows the host to change the game mode while in the lobby.            |
| `start-game`             | Client → | Tells the server to begin the game for the players in a room.          |
| `player-move`            | Client → | Sends a player's new position to the server for validation and update. |
| `player-ability`         | Client → | Triggers a player's special ability (e.g., sprint, shield).            |
| `leave-room`             | Client → | Notifies the server that a player is leaving the room.                 |
| `disconnect`             | (Event)   | Triggered when a player's connection is lost.                          |

## 📜 Available Scripts

From within the `server/` directory, you can run the following commands:

- **`npm run dev`**: Starts the server in development mode using `ts-node-dev` for automatic restarts on file changes.
- **`npm run build`**: Compiles the TypeScript code into JavaScript in the `dist/` directory.
- **`npm run start`**: Runs the compiled JavaScript application from the `dist/` directory.

## ⚙️ Environment Variables

The server requires a `.env` file for configuration. Create one by copying the example:

```sh
cp .env.example .env
```

**`server/.env`**

```env
# The port the server will run on
PORT=3000

# The URL of the frontend client, required for CORS configuration
FRONTEND_URL=http://localhost:5173
```
