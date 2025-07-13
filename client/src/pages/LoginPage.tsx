import React, { useState, FormEvent, useEffect } from "react";
import { LogoIcon } from "@components/icons";
import { useGame } from "@contexts/GameContext";

const LoginPage: React.FC = () => {
  const { login } = useGame();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("pixel-arena-username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in-50 duration-500">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-blue-500/10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-gray-900 rounded-full mb-4 border border-gray-700">
            <LogoIcon className="h-16 w-16 text-blue-500" />
          </div>
          <h1 className="text-5xl text-center font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">
            PIXEL ARENA
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Enter the arena.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-sm font-bold mb-2 text-gray-300 sr-only"
            >
              Choose Your Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="text-center text-lg shadow-inner appearance-none border-2 border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700/50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              placeholder="Enter your name"
              required
              maxLength={15}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
          >
            Play Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
