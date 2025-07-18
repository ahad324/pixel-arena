
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
      <div className="bg-surface-100/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl shadow-primary/10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-surface-200 rounded-full mb-4 border border-border">
            <LogoIcon className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl text-center font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-secondary">
            PIXEL ARENA
          </h1>
          <p className="text-text-secondary mt-2 text-lg">Enter the arena.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-sm font-bold mb-2 text-text-primary sr-only"
            >
              Choose Your Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="text-center text-lg shadow-inner appearance-none border-2 border-border rounded-lg w-full py-3 px-4 bg-surface-200/50 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
              placeholder="Enter your name"
              required
              maxLength={15}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent-secondary text-white font-bold text-lg py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!username.trim()}
          >
            Play Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
