
import React, { useEffect, useState, useRef } from "react";
import ReactionManager from "@utils/ReactionManager";
import { ReactionsPanel, ReactionOverlay } from "@components/shared/Reactions";
import { motion, AnimatePresence } from "framer-motion";

const ReactionsComponent: React.FC = () => {
  const [latestEmoji, setLatestEmoji] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    ReactionManager.onReceive((emoji: string) => {
      setLatestEmoji(emoji);
    });
    return () => ReactionManager.offReceive();
  }, []);

  const handleReact = (emoji: string) => {
    ReactionManager.send(emoji);
    setLatestEmoji(emoji);
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[60]">
        <AnimatePresence>
          {isPanelOpen && (
            <ReactionsPanel
              onReact={handleReact}
              onClose={() => setIsPanelOpen(false)}
            />
          )}
        </AnimatePresence>
        <motion.button
          ref={triggerRef}
          onClick={() => setIsPanelOpen(p => !p)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-surface-200 text-text-primary text-2xl rounded-full border-2 border-border shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <motion.span animate={{ rotate: isPanelOpen ? 45 : 0 }}>😊</motion.span>
        </motion.button>
      </div>

      {isPanelOpen && <div className="fixed inset-0 z-[59]" onClick={() => setIsPanelOpen(false)} />}

      <ReactionOverlay triggerEmoji={latestEmoji} />
    </>
  );
};

export default ReactionsComponent;
