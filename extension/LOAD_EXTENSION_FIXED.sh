#!/bin/bash

echo "🔧 FIXING EXTENSION LOADING ISSUE..."
echo ""

# Go to extension directory
cd /Users/anishshinde/speedy/extension

# Clean everything
echo "1️⃣ Cleaning old build..."
rm -rf dist
rm -rf node_modules/.vite

# Rebuild
echo "2️⃣ Building fresh..."
npm run build

# Verify files
echo ""
echo "3️⃣ Verifying files..."
if [ -f "dist/manifest.json" ]; then
    echo "✅ manifest.json exists"
else
    echo "❌ manifest.json missing!"
    exit 1
fi

if [ -f "dist/content/content-script.js" ]; then
    echo "✅ content-script.js exists"
else
    echo "❌ content-script.js missing!"
    exit 1
fi

if [ -f "dist/background/service-worker.js" ]; then
    echo "✅ service-worker.js exists"
else
    echo "❌ service-worker.js missing!"
    exit 1
fi

if [ -f "dist/overlay/overlay.js" ]; then
    echo "✅ overlay.js exists"
else
    echo "❌ overlay.js missing!"
    exit 1
fi

echo ""
echo "4️⃣ File structure:"
ls -R dist/

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BUILD SUCCESSFUL!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "NOW LOAD THE EXTENSION:"
echo ""
echo "1. CLOSE Chrome completely (Cmd+Q)"
echo "2. Reopen Chrome"
echo "3. Go to: chrome://extensions/"
echo "4. Remove any old 'Speedy' extension"
echo "5. Click 'Load unpacked'"
echo "6. Select: /Users/anishshinde/speedy/extension/dist"
echo ""
echo "Extension path:"
echo "/Users/anishshinde/speedy/extension/dist"
echo ""
echo "If it STILL fails, run:"
echo "  open /Applications/Google\\ Chrome.app --args --disable-extensions-file-access-check"
echo ""
