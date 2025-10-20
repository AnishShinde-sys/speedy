# Cluely Chat UI Extraction

This directory contains the extracted chat interface components from the Cluely Desktop App.

## Contents

### Extracted Files

1. **`CHAT_UI_EXTRACTION.md`** - Detailed technical documentation of all extracted components, including:
   - Message bubble components (user and AI)
   - Chat input with auto-resize
   - Chat footer with smart mode toggle
   - Messages container with auto-scroll
   - All CSS classes and animation patterns
   - Component structure and dependencies

2. **`app-source/`** - Full extracted source from Cluely.app
   - Extracted from: `/Applications/Cluely.app/Contents/Resources/app.asar`
   - Contains minified/bundled production code
   - Includes all assets (fonts, icons, etc.)

3. **`main-beautified.js`** - Beautified version of main JavaScript bundle
   - 54,000+ lines of code
   - Used for analysis and component extraction

### Ready-to-Use Components

Located in `/extension/src/components/`:

1. **`CluelyChatUI.jsx`** - Complete React component library
   - `MessageBubble` - Animated message bubbles
   - `Message` - Generic message component
   - `ChatInput` - Full-featured input with textarea
   - `MessagesContainer` - Scrollable messages list
   - `CluelyChatUI` - Complete chat interface

2. **`CluelyChatUI.css`** - All extracted styles
   - Custom surface colors
   - Animations
   - Scrollbar styling
   - Glassmorphism effects
   - Responsive design

3. **`CluelyChatDemo.jsx`** - Working demo and examples
   - Full chat demo
   - Individual component demos
   - Usage examples
   - Installation instructions

## Key Features Extracted

✅ **Message Bubbles**
- User messages (right-aligned, blue)
- AI messages (left-aligned, white/transparent)
- Smooth scale-in animations
- Max width constraints

✅ **Chat Input**
- Auto-resizing textarea (max 2 rows)
- Animated placeholder with keyboard shortcuts
- Focus/blur state management
- Enter to send, Shift+Enter for new line

✅ **Smart Mode Toggle**
- Visual indicator
- Hover states
- Active state styling
- Tooltip support

✅ **Submit Button**
- Animated position based on input state
- Disabled state when empty
- Send icon
- Smooth transitions

✅ **Messages Container**
- Auto-scroll to bottom on new messages
- Custom scrollbar styling
- Loading state with animated dots
- Empty state message

✅ **Animations**
- Framer Motion powered
- Message entrance (scale + fade)
- Input height transitions
- Button position transitions
- Smooth spring physics

## Dependencies

```json
{
  "framer-motion": "^12.5.0",
  "react-textarea-autosize": "^8.5.8",
  "react": "^18.x"
}
```

## Installation

1. Install dependencies:
```bash
cd extension
npm install framer-motion react-textarea-autosize
```

2. Import components:
```javascript
import { CluelyChatUI } from './components/CluelyChatUI';
import './components/CluelyChatUI.css';
```

3. Use in your app:
```javascript
function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [smartMode, setSmartMode] = useState(false);

  const handleSendMessage = (content) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content
    }]);
    
    // Call your AI API here
  };

  return (
    <CluelyChatUI
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      smartMode={smartMode}
      onToggleSmartMode={() => setSmartMode(!smartMode)}
    />
  );
}
```

## Component API

### CluelyChatUI

Main chat interface component.

```typescript
interface CluelyChatUIProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  smartMode?: boolean;
  onToggleSmartMode?: () => void;
}

interface Message {
  id: string | number;
  role: 'user' | 'system';
  content: string;
}
```

### MessageBubble

Individual message bubble with animation.

```typescript
interface MessageBubbleProps {
  role: 'user' | 'system' | 'mic';
  children: React.ReactNode;
  skipAnimate?: boolean;
}
```

### ChatInput

Input component with auto-resize and features.

```typescript
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  placeholder?: string;
  shortcutKeys?: string[];
  smartMode?: boolean;
  onToggleSmartMode?: () => void;
}
```

## Styling

The components use Tailwind CSS classes. Make sure your Tailwind config includes:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'surface-chat-footer': 'rgba(24, 23, 28, 0.8)',
        'surface-action': 'rgba(255, 255, 255, 0.08)',
        'surface-action-hover': 'rgba(255, 255, 255, 0.12)',
      }
    }
  }
}
```

Or use the included CSS file which defines all custom classes.

## Customization

### Colors

Edit `CluelyChatUI.css` to customize colors:
- `.bg-surface-chat-footer` - Input footer background
- `.primary-button` - Submit button gradient
- Message bubble classes in JSX

### Animations

Modify Framer Motion props in `CluelyChatUI.jsx`:
- `transition` - Spring physics
- `initial` / `animate` - Animation states
- `duration` - Animation timing

### Layout

Adjust Tailwind classes:
- `max-w-72` - Message max width
- `max-h-[500px]` - Container height
- `gap-2` - Message spacing

## Extraction Process

1. Located Cluely.app in `/Applications/`
2. Extracted `app.asar` using `npx asar extract`
3. Found bundled code in `out/renderer/assets/`
4. Beautified JavaScript for analysis
5. Identified component patterns and class names
6. Reverse-engineered React components
7. Extracted and documented all styles
8. Created reusable component library

## Notes

- Original code is heavily minified and proprietary
- These components are inspired by and adapted from Cluely's UI
- Not a direct copy - recreated based on observed patterns
- Simplified for easier use and customization
- All animations and interactions preserved
- Fully functional and production-ready

## License

These components are reverse-engineered for educational purposes. The original Cluely app and its design are property of Cluely. Use responsibly.

## Credits

- Original Design: Cluely (https://cluely.com)
- Extraction & Adaptation: Speedy Project
- Date: October 2025

