import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Simple Chat Interface Component
 * Based on Cluely's design
 */
export const ChatInterface = ({ 
  initialMessages = [],
  onSendMessage,
  isStreaming = false 
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const chatAreaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isStreaming) {
      const newMessage = {
        id: Date.now(),
        role: 'user',
        content: inputValue.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      
      if (onSendMessage) {
        onSendMessage(inputValue.trim());
      }
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0c10]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
      {/* Chat Messages Area */}
      <div 
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} {...message} />
        ))}
        
        {/* Loading indicator */}
        {isStreaming && (
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-[#18171c]/80 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-md shadow-lg px-4 py-2">
              <LoadingDots />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`
        p-1.5 bg-[#18171c]/60 backdrop-blur-md border-t border-white/10 rounded-b-2xl
        transition-all duration-200 ${isFocused ? 'border-white/20' : ''}
      `}>
        <div className="flex items-end gap-2 px-2">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type a message..."
              disabled={isStreaming}
              rows={1}
              className="w-full bg-transparent text-white/90 placeholder:text-white/40 text-[14px] leading-[20px] resize-none outline-none py-2.5 px-1 max-h-[200px] overflow-y-auto"
              style={{ minHeight: '40px' }}
            />
          </div>
          
          {/* Send Button */}
          <motion.button
            whileHover={{ scale: inputValue.trim() ? 1.08 : 1 }}
            whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
            onClick={handleSend}
            disabled={!inputValue.trim() || isStreaming}
            className={`
              mb-2 h-10 w-10 flex items-center justify-center rounded-full transition-all duration-200
              ${inputValue.trim() && !isStreaming
                ? 'bg-[#195ecc] hover:bg-[#1852af] text-white shadow-lg shadow-[#195ecc]/30 cursor-pointer'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

/**
 * Message Bubble Component
 */
const MessageBubble = ({ role, content, timestamp }) => {
  const isUser = role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}
    >
      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          relative px-4 py-3 rounded-2xl shadow-lg
          ${isUser 
            ? 'bg-[#195ecc] text-white rounded-tr-md' 
            : 'bg-[#18171c]/80 backdrop-blur-md text-white/90 border border-white/10 rounded-tl-md'
          }
        `}>
          {isUser ? (
            <div className="text-[14px] leading-[20px] whitespace-pre-wrap break-words">
              {content}
            </div>
          ) : (
            <div className="prose prose-sm prose-light max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="text-[14px] leading-[20px] mb-2 last:mb-0 text-white/90">
                      {children}
                    </p>
                  ),
                  code: ({ inline, children }) => (
                    inline ? (
                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-[13px] text-white/95">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-[#1a1a1c] p-4 rounded-lg overflow-x-auto my-2">
                        <code className="text-[13px] text-white/90">{children}</code>
                      </pre>
                    )
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {timestamp && (
          <span className="text-[10px] text-white/40 px-2">{timestamp}</span>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Loading Dots Component
 */
const LoadingDots = () => {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          className="w-2 h-2 rounded-full bg-white/40"
        />
      ))}
    </div>
  );
};

export default ChatInterface;

