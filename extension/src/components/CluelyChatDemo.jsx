import React, { useState } from 'react';
import { CluelyChatUI, MessageBubble, ChatInput, MessagesContainer } from './CluelyChatUI';
import './CluelyChatUI.css';

/**
 * Demo/Example of Cluely-inspired Chat UI
 * Shows how to use the extracted components
 */

export const CluelyChatDemo = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'system',
      content: 'Hello! How can I help you today?'
    },
    {
      id: 2,
      role: 'user',
      content: 'Can you help me understand this code?'
    },
    {
      id: 3,
      role: 'system',
      content: 'Of course! I\'d be happy to help you understand the code. Please share the code snippet you\'d like me to explain.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [smartMode, setSmartMode] = useState(false);

  const handleSendMessage = async (content) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setIsLoading(true);
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: 'system',
        content: `You said: "${content}". This is a demo response. ${smartMode ? '(Smart mode is enabled)' : ''}`
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Cluely Chat UI Demo
          </h1>
          <p className="text-white/60 text-sm">
            Extracted and adapted from Cluely Desktop App
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 chat-container rounded-lg overflow-hidden flex flex-col">
          <CluelyChatUI
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            smartMode={smartMode}
            onToggleSmartMode={() => setSmartMode(!smartMode)}
          />
        </div>

        {/* Info */}
        <div className="mt-4 text-center text-white/40 text-xs">
          <p>Press ⌘K to focus input • Enter to send • Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

// Alternative: Individual Components Demo
export const ComponentsDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const [smartMode, setSmartMode] = useState(false);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Cluely UI Components
        </h1>

        {/* Message Bubbles */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white/90">Message Bubbles</h2>
          <div className="space-y-3 bg-black/20 p-4 rounded-lg">
            <MessageBubble role="user">
              This is a user message bubble
            </MessageBubble>
            <MessageBubble role="system">
              This is an AI/system message bubble
            </MessageBubble>
            <MessageBubble role="user">
              Messages animate in with a smooth scale effect
            </MessageBubble>
          </div>
        </section>

        {/* Chat Input */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white/90">Chat Input</h2>
          <div className="bg-black/20 p-4 rounded-lg">
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={(value) => {
                console.log('Submitted:', value);
                setInputValue('');
              }}
              smartMode={smartMode}
              onToggleSmartMode={() => setSmartMode(!smartMode)}
              placeholder="Type your message here..."
            />
          </div>
        </section>

        {/* Messages Container */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white/90">Messages Container</h2>
          <div className="bg-black/20 rounded-lg h-96">
            <MessagesContainer
              messages={[
                { id: 1, role: 'system', content: 'Welcome to the chat!' },
                { id: 2, role: 'user', content: 'Hello!' },
                { id: 3, role: 'system', content: 'How can I assist you today?' },
                { id: 4, role: 'user', content: 'I need help with my code' },
                { id: 5, role: 'system', content: 'I\'d be happy to help! Please share your code.' }
              ]}
              isLoading={false}
            />
          </div>
        </section>

        {/* Features List */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white/90">Features</h2>
          <div className="bg-black/20 p-6 rounded-lg">
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Smooth animations with Framer Motion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Auto-resizing textarea</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Smart mode toggle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Auto-scroll to latest message</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Keyboard shortcuts display</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Custom scrollbar styling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Glassmorphism effects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Responsive design</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Installation Instructions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white/90">Installation</h2>
          <div className="bg-black/20 p-6 rounded-lg">
            <div className="space-y-4 text-white/70 text-sm">
              <div>
                <p className="font-semibold text-white/90 mb-2">Required Dependencies:</p>
                <pre className="bg-black/40 p-3 rounded text-xs overflow-x-auto">
                  npm install framer-motion react-textarea-autosize
                </pre>
              </div>
              <div>
                <p className="font-semibold text-white/90 mb-2">Usage:</p>
                <pre className="bg-black/40 p-3 rounded text-xs overflow-x-auto">
{`import { CluelyChatUI } from './components/CluelyChatUI';
import './components/CluelyChatUI.css';

function App() {
  const [messages, setMessages] = useState([]);
  
  return (
    <CluelyChatUI
      messages={messages}
      onSendMessage={(msg) => {
        // Handle message
      }}
    />
  );
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CluelyChatDemo;

