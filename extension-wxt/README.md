# Speedy AI Assistant - WXT Edition

Modern browser extension built with [WXT](https://wxt.dev/) - the next-gen web extension framework.

## ✨ Features

- 🎯 **AI-Powered Chat** - Context-aware AI assistant in your browser
- 📸 **Screenshot Capture** - Region selection with no permission dialogs
- 📑 **Tab Management** - Access content from multiple tabs
- ⚡ **Hot Module Reloading** - Fast development with instant updates
- 🦊 **Cross-Browser** - Chrome MV3 & Firefox MV2 support

## 🚀 Development

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Setup

```bash
# Install dependencies
pnpm install

# Start development mode (Chrome)
pnpm dev

# Start development mode (Firefox)
pnpm dev:firefox
```

### Development Mode

WXT provides hot module reloading! Changes to your code will automatically reload the extension.

1. Run `pnpm dev`
2. Load the extension from `.output/chrome-mv3` in Chrome
3. Make changes to the code
4. Watch the extension auto-reload! ⚡

## 📦 Building

```bash
# Build for Chrome
pnpm build

# Build for Firefox  
pnpm build:firefox

# Build both
pnpm build && pnpm build:firefox
```

Built extensions will be in:
- Chrome: `.output/chrome-mv3/`
- Firefox: `.output/firefox-mv2/`

## 📤 Distribution

```bash
# Create distribution zips
pnpm zip          # Chrome
pnpm zip:firefox  # Firefox
```

Zip files will be created in `.output/` directory.

## 🎮 Usage

### Keyboard Shortcut

- **Mac**: `Command + Shift + Y`
- **Windows/Linux**: `Ctrl + Shift + Y`

### Icon Click

Click the Speedy AI icon in your browser toolbar to toggle the overlay.

## 🏗️ Project Structure

```
extension-wxt/
├── entrypoints/          # WXT entrypoints
│   ├── background.ts     # Service worker
│   └── content.ts        # Content script
├── public/
│   ├── icons/            # Extension icons
│   └── content-scripts/  # Non-WXT scripts (overlay)
├── utils/                # Shared utilities
│   └── analytics.js      # PostHog analytics
├── wxt.config.ts         # WXT configuration
└── package.json
```

## 🔧 Configuration

Edit `wxt.config.ts` to modify:
- Extension name & description
- Permissions
- Keyboard shortcuts
- Manifest settings

## 📝 Key Differences from Old Extension

### Benefits of WXT:

1. **Better DX** - Hot module reloading, TypeScript support
2. **Simpler Build** - One config file instead of complex Vite setup
3. **Auto-Manifest** - WXT generates manifests for both Chrome & Firefox
4. **Type Safety** - Built-in TypeScript definitions for WebExtensions APIs
5. **Modern Tooling** - Built on Vite 5 with optimized bundling

### Migration Notes:

- Background script now uses `defineBackground()` 
- Content scripts use `defineContentScript()`
- Overlay remains in `public/` as a non-WXT script (runs in page context)
- No more manual manifest management
- Simplified build process

## 🐛 Debugging

### Chrome DevTools

1. Open the extension popup/overlay
2. Right-click → Inspect
3. Check Console for logs

### Background Service Worker

1. Go to `chrome://extensions`
2. Find Speedy AI Assistant
3. Click "service worker" link
4. View background script logs

## 🔗 Resources

- [WXT Documentation](https://wxt.dev/)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Firefox Extension Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## 📄 License

MIT

---

Built with ❤️ using WXT
