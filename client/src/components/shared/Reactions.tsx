
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "@components/icons";

interface ReactionBurst {
  id: string;
  emoji: string;
  left: string;
  xDrift: number;
  rotation: number;
}

interface ReactionsPanelProps {
  onReact: (emoji: string) => void;
  onClose: () => void;
}

const ALL_REACTIONS = ["👍", "😂", "😍", "😮", "😢", "👏", "🔥", "🤯", "💯", "🎉", "🙏", "🤔", "🤣", "💔", "❤️"];

const ReactionsPanel: React.FC<ReactionsPanelProps> = ({ onReact, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  useLayoutEffect(() => {
    const updateItems = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;

      if (width >= 360) setItemsPerPage(5);
      else if (width >= 280) setItemsPerPage(4);
      else setItemsPerPage(3);
    };

    updateItems();
    window.addEventListener("resize", updateItems);
    return () => window.removeEventListener("resize", updateItems);
  }, []);

  const totalPages = Math.ceil(ALL_REACTIONS.length / itemsPerPage);

  const visibleReactions = ALL_REACTIONS.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      ref={containerRef}
      className="absolute bottom-[calc(100%_+_0.5rem)] left-0 bg-surface-100/70 backdrop-blur-md border border-border rounded-2xl shadow-2xl px-5 py-6 w-[90vw] max-w-xs sm:max-w-sm cursor-grab active:cursor-grabbing"
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary z-10">
        <XIcon className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="p-2 rounded-full disabled:opacity-30 enabled:hover:bg-surface-200 text-text-primary flex-shrink-0"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div className="flex-grow w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={page + '-' + itemsPerPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center gap-3"
            >
              {visibleReactions.map((emoji) => (
                <motion.button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-4xl"
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
          className="p-2 rounded-full disabled:opacity-30 enabled:hover:bg-surface-200 text-text-primary flex-shrink-0"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="flex justify-center mt-2 space-x-1.5">
        {Array.from({ length: totalPages }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${i === page ? 'bg-text-primary' : 'bg-border'}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

interface ReactionOverlayProps {
  triggerEmoji: string;
}

const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ triggerEmoji }) => {
  const [reactions, setReactions] = useState<ReactionBurst[]>([]);
  const lastTriggerTime = useRef(0);
  const queue = useRef<string[]>([]);

  useEffect(() => {
    if (!triggerEmoji) return;
    const now = Date.now();
    if (now - lastTriggerTime.current < 200) {
      queue.current.push(triggerEmoji);
      return;
    }
    lastTriggerTime.current = now;
    triggerBurst(triggerEmoji);
  }, [triggerEmoji]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (queue.current.length > 0) {
        const emoji = queue.current.shift();
        if (emoji) {
          lastTriggerTime.current = Date.now();
          triggerBurst(emoji);
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const triggerBurst = (emoji: string) => {
    const burstSize = 3 + Math.floor(Math.random() * 3);
    const newReactions: ReactionBurst[] = [];

    for (let i = 0; i < burstSize; i++) {
      const newReaction: ReactionBurst = {
        id: crypto.randomUUID(),
        emoji,
        left: `${Math.random() * 80 + 10}%`,
        xDrift: (Math.random() - 0.5) * 150,
        rotation: Math.random() * 360 - 180,
      };
      newReactions.push(newReaction);
    }

    setReactions((prev) => [...prev, ...newReactions]);

    newReactions.forEach((reaction) => {
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 2200);
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[61] overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 1, y: '100vh', scale: 0.5 }}
            animate={{
              opacity: [1, 1, 0],
              y: ['80vh', '30vh', '0vh'],
              x: [0, reaction.xDrift * 0.5, reaction.xDrift],
              scale: [0.5, 1.2, 0.8],
              rotate: [0, reaction.rotation / 2, reaction.rotation],
            }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="absolute text-3xl sm:text-4xl select-none"
            style={{ left: reaction.left, willChange: 'transform, opacity' }}
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { ReactionsPanel, ReactionOverlay };
