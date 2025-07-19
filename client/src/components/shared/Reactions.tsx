import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ReactionBurst {
  id: string;
  emoji: string;
  left: string;
  xDrift: number;
  rotation: number;
}

interface ReactionsPanelProps {
  onReact: (emoji: string) => void;
  availableReactions?: string[];
  className?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

const DEFAULT_REACTIONS = ["👍", "😂", "😍", "😮", "😢", "👏"];

const ReactionsPanel: React.FC<ReactionsPanelProps> = ({
  onReact,
  availableReactions = DEFAULT_REACTIONS,
  className = "",
  onClose,
  isOpen = false,
}) => {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={constraintsRef} className="fixed inset-0 z-50 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragConstraints={constraintsRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`pointer-events-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              rounded-md border border-border shadow-xl px-5 pb-4 pt-3 w-fit
              bg-surface-100 text-text-primary backdrop-blur-md ${className}`}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-white text-3xl font-bold leading-none transition"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              {availableReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className="text-3xl sm:text-4xl hover:scale-125 transition-transform duration-200"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ReactionOverlayProps {
  triggerEmoji: string;
}

const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ triggerEmoji }) => {
  const [reactions, setReactions] = useState<ReactionBurst[]>([]);

  useEffect(() => {
    if (!triggerEmoji) return;

    const leftPercent = Math.random() * 60 + 20;
    const newReaction: ReactionBurst = {
      id: crypto.randomUUID(),
      emoji: triggerEmoji,
      left: `${leftPercent}%`,
      xDrift: (Math.random() - 0.5) * 100,
      rotation: Math.random() * 40 - 20,
    };

    setReactions((prev) => [...prev, newReaction]);

    const cleanupTimer = setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2200);

    return () => clearTimeout(cleanupTimer);
  }, [triggerEmoji]);

  return (
    <div className="fixed bottom-20 left-0 w-full pointer-events-none z-40">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, y: 0, scale: 0.6, x: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [-10, -80, -160, -240],
              scale: [0.6, 1.2, 1, 0.8],
              x: [0, reaction.xDrift * 0.3, reaction.xDrift * 0.6, reaction.xDrift],
              rotate: reaction.rotation,
            }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="absolute text-3xl sm:text-4xl select-none"
            style={{ left: reaction.left }}
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { ReactionsPanel, ReactionOverlay };
