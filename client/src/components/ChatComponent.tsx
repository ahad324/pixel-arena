import React, { useEffect, useState, useRef } from "react";
import ChatManager from "@utils/ReactionManager";
import { EmojiPicker, ReactionOverlay } from "@components/shared/Reactions";
import { useGame } from "@contexts/GameContext";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { ArrowRightIcon, ChevronDownIcon } from "./icons";

const ChatComponent: React.FC = () => {
  const { chatMessages, user } = useGame();
  const [legacyReaction, setLegacyReaction] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const prevMessagesLength = useRef(chatMessages.length);

  useEffect(() => {
    // Keep legacy reaction handling for backward compatibility or other features
    ChatManager.onReceiveLegacyReaction((emoji: string) => {
      setLegacyReaction(emoji);
    });
    return () => ChatManager.offAll();
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (chatMessages.length > prevMessagesLength.current && !isChatOpen) {
      setHasNewMessage(true);
    }
    prevMessagesLength.current = chatMessages.length;
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = () => {
    if (user && inputValue.trim()) {
      ChatManager.sendMessage(inputValue);
      setInputValue("");
      setIsPickerOpen(false);
    }
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setInputValue(prev => prev + emoji);
  };

  const handleToggleChat = () => {
    if (!isChatOpen) {
      setHasNewMessage(false);
    }
    setIsChatOpen(p => !p);
  };
  
  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 z-[60]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              drag
              dragListener={false}
              dragControls={dragControls}
              dragMomentum={false}
              dragConstraints={{ top: -500, bottom: 0, left: 0, right: 500 }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-[calc(100%_+_0.5rem)] left-0 bg-surface-100/70 backdrop-blur-md border border-border rounded-2xl shadow-2xl w-[90vw] max-w-sm max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <motion.div 
                onPointerDown={(e) => { e.preventDefault(); dragControls.start(e); }}
                className="p-3 flex items-center justify-between border-b border-border flex-shrink-0 cursor-grab active:cursor-grabbing"
              >
                <h3 className="font-bold text-text-primary">Room Chat</h3>
                <button onClick={() => setIsChatOpen(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                  <ChevronDownIcon className="w-6 h-6" />
                </button>
              </motion.div>

              {/* Messages */}
              <div className="flex-grow p-3 overflow-y-auto scrollbar-thin">
                <div className="space-y-4">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-2 ${msg.senderId === user.id ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: msg.senderColor }} />
                      <div className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-text-secondary px-2">{msg.senderName}</span>
                        <div className={`px-3 py-2 rounded-xl max-w-xs break-words ${msg.senderId === user.id ? 'bg-primary text-text-on-primary rounded-br-none' : 'bg-surface-200 text-text-primary rounded-bl-none'}`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Emoji Picker */}
              <AnimatePresence>
                {isPickerOpen && <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setIsPickerOpen(false)} />}
              </AnimatePresence>

              {/* Input */}
              <div className="p-3 border-t border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                   <button onClick={() => setIsPickerOpen(p => !p)} className="p-2 text-2xl rounded-full hover:bg-surface-200">
                     😊
                   </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-grow px-3 py-2 bg-surface-200 border border-border rounded-full text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={handleSendMessage} className="p-2 bg-primary rounded-full text-text-on-primary hover:bg-primary-hover disabled:opacity-50" disabled={!inputValue.trim()}>
                    <ArrowRightIcon className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleToggleChat}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative w-14 h-14 bg-surface-200 text-text-primary text-2xl rounded-full border-2 border-border shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={isChatOpen ? "Close chat" : "Open chat"}
        >
          <AnimatePresence>
            {hasNewMessage && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-surface-200"
                aria-label="New message notification"
              />
            )}
          </AnimatePresence>
          💬
        </motion.button>
      </div>

      <ReactionOverlay triggerEmoji={legacyReaction} />
    </>
  );
};

export default ChatComponent;