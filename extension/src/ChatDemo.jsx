import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatInterface } from './components/ChatInterface';
import './index.css';

function ChatDemo() {
  const [messages, setMessages] = React.useState([
    {
      id: 1,
      role: 'user',
      content: 'whats up',
      timestamp: '2:34 PM'
    },
    {
      id: 2,
      role: 'assistant',
      content: "You're editing the `buildMessageContent` function in `api.js`, which formats context data into XML-like tags. Terminal shows MongoDB installed and running via Homebrew. The right panel lists tasks for building a modern chat interface.",
      timestamp: '2:34 PM'
    }
  ]);
  const [isStreaming, setIsStreaming] = React.useState(false);

  const handleSendMessage = (message) => {
    // Add user message
    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setIsStreaming(true);
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'This is a simulated response from the AI.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsStreaming(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl h-[600px]">
        <ChatInterface
          initialMessages={messages}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ChatDemo />
    </React.StrictMode>
  );
}

