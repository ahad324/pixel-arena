# ⚙️ Pixel Arena - Server

This directory contains the backend server for the Pixel Arena application. It is built with Node.js, Express, and TypeScript, and it uses Socket.IO to manage all real-time, stateful multiplayer game logic.

## ✨ Core Functionality

- **WebSocket Handling:** Manages all real-time communication via a structured Socket.IO event system.
- **State Management:** The `GameService` class holds the in-memory state of all active rooms, players, and game sessions.
- **Modular Game Logic:** Each game mode's logic is encapsulated in its own module, making it easy to maintain and extend.
- **Room Management:** Handles the creation, joining, and automatic cleanup of game rooms.
- **Asynchronous Operations:** Utilizes worker threads for heavy computations like maze generation to prevent blocking the main thread.

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Communication:** [Socket.IO](https://socket.io/)
- **Development:** [ts-node-dev](https://github.com/wclr/ts-node-dev) for live-reloading.

## 📂 Folder Structure

The `src/` directory is organized for modularity and separation of concerns:

```
src/
├── config/         # Game constants and settings (e.g., grid size, game timers)
├── services/       # Core logic services, primarily `gameService` (the game engine)
├── sockets/        # Socket.IO event listeners and emitters, connecting client actions to game logic
├── types/          # Shared TypeScript type definitions for the server
├── utils/          # Utility functions (e.g., maze generation and worker pool)
├── app.ts          # Express app configuration (CORS, basic routes)
└── index.ts        # Server entry point, initializes the HTTP server and Socket.IO instance
```

## 📡 WebSocket API

The server communicates with clients through a defined set of Socket.IO events.

### Client → Server Events

| Event Name              | Payload Data                                 | Description                                                               |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| `get-available-rooms`   | (none)                                       | Asks the server for a list of joinable rooms.                             |
| `create-room`           | `{ user, gameMode }`                         | Creates a new game room with the specified host and game mode.            |
| `join-room`             | `{ roomId, user }`                           | Allows a player to join an existing room using a room code.               |
| `leave-room`            | (none)                                       | Notifies the server that the client is leaving their current room.        |
| `set-game-mode`         | `{ roomId, gameMode }`                       | Allows the host to change the game mode while in the lobby.               |
| `set-maze-difficulty`   | `{ roomId, playerId, difficulty }`           | (Maze Race) Sets the difficulty for the maze.                             |
| `start-game`            | `{ roomId, playerId }`                       | Tells the server to begin the game for all players in a room.             |
| `player-move`           | `{ roomId, playerId, newPos }`               | Sends a player's new position for validation and update.                  |
| `player-ability`        | `{ roomId, playerId }`                       | Triggers a player's special ability (e.g., sprint, shield, reveal).       |
| `player-heist-guess`    | `{ roomId, playerId, padId }`                | (Heist Panic) Submits a player's guess on a specific code pad.            |
| `send-reaction`         | `{ emoji }`                                  | Sends an emoji reaction to be broadcast to other players in the room.     |

### Server → Client Events

| Event Name               | Payload Data                                    | Description                                                                |
| ------------------------ | ----------------------------------------------- | -------------------------------------------------------------------------- |
| `available-rooms-update` | `Room[]`                                        | Sends the updated list of available rooms to all clients.                  |
| `game-started`           | `{ room }`                                      | Notifies all players in a room that the game has started.                  |
| `game-over`              | `{ winner, players }`                           | Announces the end of the game and sends final results.                     |
| `player-joined`          | `{ player }`                                    | Notifies players in a room that a new player has joined.                   |
| `player-left`            | `{ playerId }`                                  | Notifies players in a room that a player has left.                         |
| `host-changed`           | `{ newHostId }`                                 | Notifies players that the host has changed.                                |
| `game-mode-changed`      | `{ gameMode, gameState }`                       | Informs players that the host has changed the game mode.                   |
| `maze-difficulty-changed`| `{ difficulty, room }`                          | Informs players that the host has changed the maze difficulty.             |
| `player-moved`           | `{ playerId, x, y }`                            | Broadcasts a player's new position.                                        |
| `timer-update`           | `{ time }`                                      | Sends a per-second update of the game timer.                               |
| `scores-update`          | `{ scores }`                                    | Sends updated scores for all players.                                      |
| `receive-reaction`       | `{ emoji }`                                     | Broadcasts an emoji reaction to all players in the room.                   |
| `*`                      | (Varies)                                        | Many game-specific events like `player-tagged`, `tile-claimed`, `player-infected`, `hiders-revealed` etc. |

## 📜 Available Scripts

From within the `server/` directory, you can run the following commands:

- **`npm run dev`**: Starts the server in development mode using `ts-node-dev` for automatic restarts on file changes.
- **`npm run build`**: Compiles the TypeScript code into JavaScript in the `/dist` directory.
- **`npm run start`**: Runs the compiled JavaScript application from the `/dist` directory.

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
