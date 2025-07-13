# 🎨 Pixel Arena - Client

This directory contains the frontend for the Pixel Arena application, built with React, Vite, and TypeScript. It handles all user interface elements, real-time communication with the server, and rendering of the game state.

## ✨ Features

- **Component-Based Architecture:** Built with reusable React components.
- **Real-time Updates:** Uses `socket.io-client` to listen for and display live game updates from the server.
- **Responsive Design:** Styled with Tailwind CSS for a seamless experience on both desktop and mobile.
- **Mobile-First Controls:** Includes a virtual joystick for intuitive gameplay on touch devices.
- **Typed State:** Leverages TypeScript for robust and predictable state management.

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** React Context API
- **Communication:** [Socket.IO Client](https://socket.io/docs/v4/client-api/)

## 📂 Folder Structure

The `src/` directory is organized as follows:

```
src/
├── components/     # Reusable React components (e.g., GameBoard, PlayerAvatar, Buttons)
├── constants/      # Game constants, descriptions, and settings used on the client
├── contexts/       # React Context for global state management (e.g., user, room)
├── hooks/          # Custom React hooks (e.g., usePlayerMovement, useDeviceDetection)
├── pages/          # Top-level page components (e.g., LoginPage, LobbyPage, GamePage)
├── services/       # Service singletons, like the `socketService` wrapper
├── types/          # Shared TypeScript type definitions for the client
├── App.tsx         # Main application component, handles routing logic
└── index.tsx       # Entry point for the React application
```

## 📜 Available Scripts

From within the `client/` directory, you can run the following commands:

- **`npm run dev`**: Starts the Vite development server on `http://localhost:5173`.
- **`npm run build`**: Bundles the application for production into the `dist/` directory.
- **`npm run lint`**: Lints the codebase using ESLint to enforce code quality.
- **`npm run preview`**: Serves the production build locally to test the final output.

## ⚙️ Environment Variables

The client requires a `.env` file to know the location of the backend server. Create one by copying the example:

```sh
cp .env.example .env
```

**`client/.env`**

```env
# The URL where the backend server is running
VITE_BACKEND_URL=http://localhost:3000
```
