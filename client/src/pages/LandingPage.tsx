
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useGame } from "@contexts/GameContext";
import { PlayIcon, ArrowRightIcon } from "@components/icons";
import GithubButton from "@components/ui/GitHubButton";
import Logo from "/logo.svg";
import Particles from "@components/ui/Particles";
import StarBorder from "@components/ui/StarBorder";

const LandingPage: React.FC = () => {
  const { user } = useGame();

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-hidden">
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-3 group group-hover:border"
        >
          <img
            src={Logo}
            alt="Pixel Arena Logo"
            className="rounded-lg w-9 h-9 sm:w-10 sm:h-10 group-hover:animate-bounce-subtle"
          />
          <span className="hidden sm:block text-xl font-bold text-secondary tracking-wide transition-colors">
            Pixel Arena
          </span>
        </Link>
        <GithubButton />
      </header>

      <section className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Particles
          />
        </div>
        <div className="absolute inset-0" />

        <div className="relative z-10 text-center max-w-6xl mx-auto flex flex-col items-center">
          {/* Tagline */}
          <StarBorder color="var(--primary-hsl)">
            8 Game Modes!
          </StarBorder>


          {/* Title */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.3 },
              },
            }}
            className="text-center"
          >
            <h1
              className="text-7xl sm:text-8xl md:text-9xl tracking-tighter mb-4 text-text-primary relative"
              style={{ textShadow: "0 5px 30px hsla(var(--primary-hsl), 0.2)" }}
            >
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: "easeOut" },
                  },
                }}
                className="block bg-gradient-to-r from-accent-secondary to-purple-400 bg-clip-text text-transparent"
              >
                PIXEL
              </motion.span>
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.8,
                      delay: 0.2,
                      ease: "easeOut",
                    },
                  },
                }}
                className="block"
              >
                ARENA
              </motion.span>
            </h1>

            <motion.p
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { delay: 0.5, duration: 0.8 },
                },
              }}
              className="text-lg md:text-xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              The ultimate multiplayer gaming experience. Battle friends in
              real-time.{" "}
              <span className="text-primary font-semibold">
                No downloads required.
              </span>
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4"
          >
            <Link to={user ? "/lobby" : "/login"}>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 40px hsla(var(--primary-hsl), 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="group bg-primary hover:bg-primary-hover text-text-on-primary px-8 py-4 rounded-xl font-bold text-xl transition-all duration-300 flex items-center gap-3 shadow-lg shadow-primary/25"
              >
                <PlayIcon className="w-7 h-7" />
                {user ? "Enter Lobby" : "Start Playing"}
                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
