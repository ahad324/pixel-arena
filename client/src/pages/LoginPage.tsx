
import React, { useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Logo from "/logo.svg"
import { useGame } from "@contexts/GameContext";
import { ChevronLeftIcon } from "@components/icons";

const LoginPage: React.FC = () => {
  const { login, user } = useGame();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/lobby");
    }
  }, [user, navigate]);

  useEffect(() => {
    const savedUsername = localStorage.getItem("pixel-arena-username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
     if (trimmedUsername.length > 15) {
      setError("Username cannot be more than 15 characters.");
      return;
    }
    setError("");
    setIsLoading(true);
    // Simulate network delay for better UX
    setTimeout(() => {
      login(trimmedUsername);
      navigate("/lobby");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
        className="w-full max-w-md"
      >
        <div className="bg-surface-100 border border-border rounded-3xl p-8 shadow-2xl relative">
          <motion.button
            onClick={() => navigate("/")}
            aria-label="Back to Home"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute top-6 left-6 w-10 h-10 bg-surface-200/50 hover:bg-surface-200/80 rounded-xl flex items-center justify-center transition-colors border border-border text-text-secondary hover:text-text-primary"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </motion.button>
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex h-20 w-20 overflow-hidden bg-surface-200 border border-border rounded-2xl mb-6"
            >
              <img src={Logo} className="w-full h-full" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black mb-2 text-text-primary"
            >
              Enter the Arena
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-text-secondary"
            >
              Choose your name to begin.
            </motion.p>
          </div>
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="username" className="sr-only">
                Player Name
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                className="w-full px-4 py-4 bg-surface-200 border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-all duration-200 text-center"
                placeholder="Your Name"
                required
                maxLength={15}
                disabled={isLoading}
              />
               {error && <p className="text-error text-sm mt-2 text-center">{error}</p>}
            </div>
            <motion.button
              type="submit"
              disabled={!username.trim() || isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-4 bg-primary text-on-primary font-black rounded-xl shadow-lg hover:bg-primary-hover focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-text-on-primary/50 border-t-text-on-primary rounded-full animate-spin" />
                  <span>Entering...</span>
                </div>
              ) : (
                "Play Now"
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
