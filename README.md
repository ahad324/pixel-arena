# 🚀 Pixel Arena

<p align="center">
  <img src="https://raw.githubusercontent.com/ahad324/Pixel-Arena/main/client/public/logo.svg" alt="Pixel Arena Logo" width="120">
</p>

<h1 align="center">Pixel Arena</h1>

<p align="center">
  <strong>A real-time, browser-based multiplayer mini-game platform.</strong>
  <br />
  Create a room, share the code with friends, and compete in a variety of fast-paced, exciting game modes!
</p>

<p align="center">
  <a href="https://pixelarena.netlify.app/">
    <img src="https://img.shields.io/badge/PLAY%20NOW-58A6FF?style=for-the-badge&logo=netlify&logoColor=white" alt="Play Live">
  </a>
  <a href="https://github.com/ahad324/Pixel-Arena/stargazers">
    <img src="https://img.shields.io/github/stars/ahad324/Pixel-Arena?style=for-the-badge&logo=github&color=FFC107" alt="GitHub stars">
  </a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/ahad324/Pixel-Arena/main/Images/lobby.png" alt="Pixel Arena Lobby Screen" width="100%">
</p>

---

## Table of Contents

- [🎮 Game Modes](#-game-modes)
- [✨ Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📜 Available Scripts](#-available-scripts)

---

## 🎮 Game Modes

Pixel Arena features a growing collection of unique games, each with its own objective and rules.

| Game Mode             | Icon | Description                                                                          |
| --------------------- | :--: | ------------------------------------------------------------------------------------ |
| **Tag**               |  🏃‍♂️  | The classic playground game. Avoid being 'It' to score points.                       |
| **Territory Control** |  🎨  | Claim as much of the grid as possible with your color before time runs out.          |
| **Maze Race**         |  🗺️  | Be the first player to navigate a procedurally generated maze and reach the exit.    |
| **Hide and Seek**     |  👻  | One Seeker hunts Hiders in a maze. Caught Hiders join the Seekers. Survive to win!   |
| **Heist Panic**       |  💰  | Find the correct code pad to escape the vault. A wrong guess will stun you!          |
| **Infection Arena**   |  🦠  | One player is the 'Virus'. Evade infection or spread it. Last survivor wins!         |
| **Trap Rush**         |  💣  | Race to the finish line across a field of hidden, debilitating traps.                |
| **Spy & Decode**      |  🕵️  | A game of social deduction. A secret spy must signal a code to allies.                 |

---

## ✨ Features

- ⚡️ **Real-time Multiplayer:** Powered by **Socket.IO** for instant, low-latency action.
- 🚪 **Dynamic Room System:** Create private rooms with a unique code or join public rooms from the lobby.
- 🕹️ **Diverse Game Modes:** A wide selection of games with unique mechanics, from racing to social deduction.
- 📱 **Responsive & Mobile-First:** Play seamlessly on both desktop and mobile devices with a virtual joystick.
- 😂 **Live Emoji Reactions:** Send emojis that burst across everyone's screen in real-time.
- ✨ **Dynamic Game Statuses:** "New", "Updated", and "Popular" badges highlight different games.
- 💾 **Persistent Username:** Your name is saved in local storage for quick re-entry.

---

## 📸 Screenshots

![Infection Arena Gameplay](https://raw.githubusercontent.com/ahad324/Pixel-Arena/main/Images/infection-arena.png)
*Gameplay from Infection Arena*

![Heist Panic Gameplay](https://raw.githubusercontent.com/ahad324/Pixel-Arena/main/Images/heist-panic.png)
*Gameplay from Heist Panic*

---

## 🛠️ Tech Stack

The project is a **monorepo** containing the React client and the Node.js server.

**🚀 Frontend:**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.io-black?style=flat&logo=socket.io&badgeColor=010101)
![Framer Motion](https://img.shields.io/badge/Framer-black?style=flat&logo=framer&logoColor=blue)

**⚙️ Backend:**

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat&logo=express&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.io-black?style=flat&logo=socket.io&badgeColor=010101)

**☁️ Deployment & Build:**

![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=flat&logo=netlify&logoColor=white)
![Nixpacks](https://img.shields.io/badge/Nixpacks-2088ff?style=flat)

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v22.x or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### 1. Clone the Repository

```sh
git clone https://github.com/ahad324/Pixel-Arena.git
cd Pixel-Arena
```

### 2. Set Up the Backend

The server runs on port `3000` by default.

```sh
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create an environment file from the example
# (No changes are needed for default local setup)
cp .env.example .env

# Start the development server
npm run dev
```

> The backend server will be running at `http://localhost:3000`.

### 3. Set Up the Frontend

In a **new terminal window**, set up the client. The client runs on port `5173` by default.

```sh
# Navigate to the client directory from the root
cd client

# Install dependencies
npm install

# Create an environment file from the example
# (No changes are needed for default local setup)
cp .env.example .env

# Start the development server
npm run dev
```

> You can now access the application at `http://localhost:5173`.

---

## ⚙️ Environment Variables

The application uses environment variables for configuration. The default values in `.env.example` are suitable for local development.

### Server (`server/.env`)

This file configures the server port and the allowed origin for CORS.

```env
# The port the server will run on
PORT=3000
# The URL of your running frontend client, required for CORS
FRONTEND_URL=http://localhost:5173
```

### Client (`client/.env`)

This file tells the frontend where to find the backend server.

```env
# The URL of your running backend server
VITE_BACKEND_URL=http://localhost:3000
```

---

## 📜 Available Scripts

### Server (`/server`)

- **`npm run dev`**: Starts the server in development mode with hot-reloading using `ts-node-dev`.
- **`npm run build`**: Compiles the TypeScript code to JavaScript in the `/dist` directory.
- **`npm run start`**: Starts the compiled server from the `/dist` directory.

### Client (`/client`)

- **`npm run dev`**: Starts the Vite development server.
- **`npm run build`**: Builds the application for production.
- **`npm run preview`**: Serves the production build locally for testing.

---

*This project was built for fun and to demonstrate full-stack real-time application development. Feel free to fork, contribute, or get inspired!*
