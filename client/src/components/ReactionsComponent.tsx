import React, { useEffect, useState } from "react";
import ReactionManager from "@utils/ReactionManager";
import { ReactionsPanel, ReactionOverlay } from "@components/shared/Reactions";
import { AnimatePresence, motion } from "framer-motion";

interface ReactionsComponentProps {
  buttonClassName?: string;
}

const ReactionsComponent: React.FC<ReactionsComponentProps> = ({ buttonClassName = "" }) => {
  const [latestEmoji, setLatestEmoji] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    ReactionManager.onReceive((emoji: string) => {
      setLatestEmoji(emoji);
    });
    return () => {
      ReactionManager.offReceive();
    };
  }, []);

  const handleReact = (emoji: string) => {
    ReactionManager.send(emoji);
    setLatestEmoji(emoji);
  };

  return (
    <>
      <AnimatePresence>
        {!isPanelOpen && (
          <motion.button
            key="react-btn"
            onClick={() => setIsPanelOpen(true)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`w-12 h-12 bg-primary text-white text-2xl rounded-full hover:bg-primary-hover transition shadow-lg flex items-center justify-center ${buttonClassName}`}
          >
            🎉
          </motion.button>
        )}
      </AnimatePresence>

      <ReactionsPanel
        onReact={handleReact}
        onClose={() => setIsPanelOpen(false)}
        isOpen={isPanelOpen}
      />

      <ReactionOverlay triggerEmoji={latestEmoji} />
    </>
  );
};

export default ReactionsComponent;
