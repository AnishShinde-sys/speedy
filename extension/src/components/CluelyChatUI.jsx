import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';

/**
 * Cluely-inspired Chat UI Components
 * Extracted and adapted from Cluely Desktop App
 */

// Message Bubble Component
export const MessageBubble = ({ role, children, skipAnimate = false }) => {
  const isUser = role === 'user' || role === 'mic';
  
  const baseClasses = "px-2.5 py-1.5 w-fit max-w-72 rounded-lg text-white/90 text-xs shadow-xs";
  const roleClasses = isUser 
    ? "ml-auto bg-sky-400/60 saturate-150" 
    : "mr-auto bg-white/10";

  return (
    <motion.div
      className={`${baseClasses} ${roleClasses}`}
      initial={skipAnimate ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Generic Message with Side Alignment
export const Message = ({ side = 'left', children }) => {
  const alignClass = side === 'left' ? 'justify-start' : 'justify-end';
  const bgClass = side === 'left' ? 'bg-white/10' : 'bg-sky-400/60';
  
  return (
    <div className={`flex items-center ${alignClass}`}>
      <div className={`rounded-lg py-1.5 px-2 max-w-[80%] text-[13px] leading-[19px] ${bgClass} text-white/90`}>
        {children}
      </div>
    </div>
  );
};

// Keyboard Key Display
const KeyboardKey = ({ char }) => (
  <div className="w-fit h-fit inline-block text-[10px] text-white/40 border rounded-md px-[3px] py-0.5">
    {char}
  </div>
);

// Chat Input Component
export const ChatInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  onFocus, 
  onBlur,
  placeholder = "Ask about your screen or conversation...",
  shortcutKeys = ['⌘', 'K'],
  smartMode = false,
  onToggleSmartMode
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit?.(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      {/* Input Area */}
      <motion.div
        className="relative overflow-hidden"
        animate={{ height: isFocused ? "fit-content" : "40px" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <TextareaAutosize
          ref={textareaRef}
          maxRows={2}
          className="relative z-10 block resize-none w-full p-2.5 rounded-t-lg focus:outline-none text-[13px] text-white scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/50 bg-transparent"
          style={{ boxShadow: "0 2px 20px -1px rgba(0, 0, 0, 0.05) inset" }}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          data-testid="chat-input"
        />

        {/* Placeholder */}
        {value === "" && (
          <AnimatePresence mode="popLayout">
            <motion.span
              key={isFocused ? "expanded" : "collapsed"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute top-2.5 left-2.5 right-2.5 text-[13px] pointer-events-none text-white/60"
            >
              {isFocused ? (
                <>
                  {placeholder}, or
                  <div className="inline-flex items-center gap-1 mx-1 -translate-y-px">
                    <KeyboardKey char="⏎" />
                  </div>
                  for Assist
                </>
              ) : (
                <>
                  Click to type, or
                  <div className="inline-flex items-center gap-1 mx-1 -translate-y-px">
                    {shortcutKeys.map((key, i) => (
                      <KeyboardKey key={i} char={key} />
                    ))}
                  </div>
                  for assist
                </>
              )}
            </motion.span>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Footer */}
      <div className="rounded-b-lg">
        <div className="p-1.5 bg-surface-chat-footer rounded-b-lg flex border-white/25 border-t-[0.5px] items-center gap-2 justify-between">
          {/* Smart Mode Toggle */}
          {onToggleSmartMode && (
            <button
              onClick={onToggleSmartMode}
              className="hover:text-white/70 hover:border-white/40 focus:outline-none"
              title="Good for coding, reasoning, and web searches"
            >
              <div className={`flex h-5 px-1.5 gap-1 items-center justify-start text-xs overflow-hidden rounded-full bg-[#18171C]/60 text-secondary-foreground hover:text-primary-foreground hover:border-primary-foreground transition-colors ${
                smartMode ? 'text-yellow-200/90 bg-yellow-300/20 border-yellow-200/60 hover:text-yellow-200 hover:bg-yellow-300/30 hover:border-yellow-200/80' : ''
              }`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span>Smart</span>
              </div>
            </button>
          )}

          {/* Submit Button */}
          <motion.div
            className="flex items-center gap-1.5 absolute"
            layout
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={isFocused ? { right: 8, bottom: 6 } : { right: 8, bottom: 8 }}
          >
            <button
              onClick={handleSubmit}
              className="size-6 gap-1 text-xs rounded-full primary-button flex items-center justify-center text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors"
              data-testid="submit-manual-input"
              disabled={!value.trim()}
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Messages Container
export const MessagesContainer = ({ messages = [], isLoading = false }) => {
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      className="flex-1 px-3 min-h-0 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/50"
    >
      {messages.length > 0 ? (
        <div className="flex flex-col gap-2">
          {messages.map((msg, index) => (
            <Message key={msg.id || index} side={msg.role === 'user' ? 'right' : 'left'}>
              {msg.content}
            </Message>
          ))}
          {isLoading && (
            <Message side="left">
              <div className="flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
              </div>
            </Message>
          )}
        </div>
      ) : (
        <div className="text-white/50 pb-0.5 leading-none text-sm">
          Waiting for messages...
        </div>
      )}
    </div>
  );
};

// Complete Chat Interface
export const CluelyChatUI = ({ 
  messages = [], 
  onSendMessage,
  isLoading = false,
  smartMode = false,
  onToggleSmartMode
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (value) => {
    if (value.trim()) {
      onSendMessage?.(value);
      setInputValue('');
    }
  };

  return (
    <div className="text-white text-sm h-full overflow-hidden flex flex-col min-h-0">
      {/* Messages */}
      <MessagesContainer messages={messages} isLoading={isLoading} />
      
      {/* Input */}
      <div className="mt-auto">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          smartMode={smartMode}
          onToggleSmartMode={onToggleSmartMode}
        />
      </div>
    </div>
  );
};

export default CluelyChatUI;

