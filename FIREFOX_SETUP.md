# Firefox Extension Setup

Your Speedy AI Assistant extension is now compatible with Firefox! 🎉

## Build Instructions

### For Chrome:
```bash
cd extension
npm run build:chrome
# Output will be in extension/dist/
```

### For Firefox:
```bash
cd extension
npm run build:firefox
# Output will be in extension/dist/
```

### For Both Browsers:
```bash
cd extension
npm run build
# Builds both Chrome and Firefox versions
```

## Development Mode

### Chrome Development:
```bash
npm run dev:chrome
```

### Firefox Development:
```bash
npm run dev:firefox
```

## Loading the Extension

### In Firefox:
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to `extension/dist/` and select `manifest.json`
5. The extension will be loaded and ready to use!

### Reloading After Changes:
1. Go to `about:debugging` → "This Firefox"
2. Find "Speedy AI Assistant" in the list
3. Click the "Reload" button
4. The updated extension will be loaded

### In Chrome:
1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/dist/` folder
5. The extension will be loaded!

## Testing the Extension

After loading:
1. Click the extension icon in the toolbar
2. Try the keyboard shortcut: `Cmd+Alt+A` (Mac) or `Ctrl+Alt+A` (Windows/Linux)
3. The AI overlay should appear
4. Test tab content extraction and chat features

## Key Differences

### Chrome Version:
- Uses Manifest V3
- Service worker for background script
- Modern Chrome APIs

### Firefox Version:
- Uses Manifest V2 (better Firefox compatibility)
- Persistent background page
- Browser polyfill for cross-browser compatibility
- Works with Firefox 91.0+

## File Structure

After building:
```
extension/dist/
├── manifest.json (Chrome MV3 or Firefox MV2)
├── background/
│   └── service-worker.js
├── content/
│   └── content-script.js
├── overlay/
│   └── overlay.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── browser-polyfill.min.js (Firefox only)
```

## Troubleshooting

### Firefox Issues:
- Make sure you're using Firefox 91.0 or later
- Check console for errors: `Ctrl+Shift+K` (Browser Console)
- Verify the extension ID in manifest matches: `speedy-ai@example.com`

### Chrome Issues:
- Ensure Chrome is updated to latest version
- Check extension errors in `chrome://extensions`
- Look for console errors: `Ctrl+Shift+I`

### API Connection:
- Make sure your local API server is running on `http://localhost:3001`
- Both versions maintain the same API connectivity

## Development Notes

The extension now uses:
- **webextension-polyfill** for cross-browser compatibility
- Separate manifests for each browser
- Automatic IIFE wrapping for content scripts
- Browser-specific build configurations

You can now develop once and deploy to both Chrome and Firefox!
