# Chat Interface Component

Simple, clean chat interface extracted from Cluely's design.

## Usage

```jsx
import { ChatInterface } from './components/ChatInterface';

function App() {
  const handleSendMessage = (message) => {
    console.log('Sending:', message);
    // Call your API here
  };

  return (
    <div className="h-screen w-screen bg-black p-6">
      <ChatInterface
        initialMessages={[
          {
            id: 1,
            role: 'user',
            content: 'Hello!',
            timestamp: '2:34 PM'
          },
          {
            id: 2,
            role: 'assistant',
            content: 'Hi! How can I help you?',
            timestamp: '2:34 PM'
          }
        ]}
        onSendMessage={handleSendMessage}
        isStreaming={false}
      />
    </div>
  );
}
```

## Props

- `initialMessages` - Array of message objects
- `onSendMessage` - Callback when user sends a message
- `isStreaming` - Boolean to show loading indicator

## Features

- ✅ Auto-expanding textarea
- ✅ Markdown support for AI responses
- ✅ Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- ✅ Smooth animations
- ✅ Dark glassmorphic design
- ✅ Auto-scroll to bottom

