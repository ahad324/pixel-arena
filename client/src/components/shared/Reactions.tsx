import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmojis } from "@hooks/useEmojis";
import type { Emoji } from "../../types";
import Loader from "@components/Loader";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const Tab: React.FC<{ name: string; isActive: boolean; onClick: (name: string) => void; }> = ({ name, isActive, onClick }) => (
    <button
      onClick={() => onClick(name)}
      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
        isActive
          ? "bg-primary text-text-on-primary"
          : "text-text-secondary hover:bg-surface-200 hover:text-text-primary"
      }`}
    >
      {name}
    </button>
  );

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const { groupedEmojis, isLoading, error } = useEmojis();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(groupedEmojis[0]?.name || "");

  useEffect(() => {
    if (!activeTab && groupedEmojis.length > 0) {
      setActiveTab(groupedEmojis[0].name);
    }
  }, [groupedEmojis, activeTab]);

  const filteredEmojis = useMemo(() => {
    if (!searchTerm) {
      return groupedEmojis.find(g => g.name === activeTab)?.emojis || [];
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return groupedEmojis
      .flatMap(g => g.emojis)
      .filter(emoji =>
        emoji.annotation.toLowerCase().includes(lowerCaseSearch) ||
        emoji.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearch))
      );
  }, [searchTerm, groupedEmojis, activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-surface-100/70 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Search emojis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-surface-200 border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {!searchTerm && (
        <div className="px-3 pb-2 overflow-x-auto scrollbar-thin flex space-x-2 flex-shrink-0 border-b border-border">
          {groupedEmojis.map(group => (
            <Tab
                key={group.name}
                name={group.name}
                isActive={activeTab === group.name}
                onClick={setActiveTab}
            />
          ))}
        </div>
      )}
      
      <div className="flex-grow p-3 overflow-y-auto scrollbar-thin h-48">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader text="Loading Emojis..." />
          </div>
        ) : error ? (
          <div className="text-center text-error p-4">{error}</div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            <AnimatePresence>
              {filteredEmojis.map((emoji: Emoji) => (
                <motion.button
                  key={emoji.hexcode}
                  title={emoji.annotation}
                  onClick={() => onEmojiSelect(emoji.emoji)}
                  className="p-1 text-2xl rounded-lg hover:bg-surface-200 transition-colors"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  layout
                >
                  {emoji.emoji}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface ReactionOverlayProps {
  triggerEmoji: string;
}

export const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ triggerEmoji }) => {
  const [reactions, setReactions] = useState<{ id: string; emoji: string; }[]>([]);

  useEffect(() => {
    if (!triggerEmoji) return;
    const id = crypto.randomUUID();
    setReactions(prev => [...prev, { id, emoji: triggerEmoji }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2200);
  }, [triggerEmoji]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[61] overflow-hidden">
      <AnimatePresence>
        {reactions.map(({id, emoji}) => (
          <motion.div
            key={id}
            initial={{ opacity: 1, y: '100vh', scale: 0.5, x: `${Math.random() * 80 + 10}vw` }}
            animate={{
              opacity: [1, 1, 0],
              y: ['80vh', '30vh', '0vh'],
              scale: [0.5, 1.2, 0.8],
              rotate: [0, (Math.random() - 0.5) * 90, (Math.random() - 0.5) * 180],
            }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="absolute text-3xl sm:text-4xl select-none"
          >
            {emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
