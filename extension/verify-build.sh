#!/bin/bash

echo "🔍 Verifying Extension Build..."
echo ""

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found!"
    echo "Run: npm run build"
    exit 1
fi

echo "✓ dist directory exists"

# Check required files
files=(
    "dist/manifest.json"
    "dist/background/service-worker.js"
    "dist/content/content-script.js"
    "dist/overlay/overlay.js"
)

all_good=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(ls -lh "$file" | awk '{print $5}')
        echo "✓ $file ($size)"
    else
        echo "❌ $file - NOT FOUND"
        all_good=false
    fi
done

echo ""

if [ "$all_good" = true ]; then
    echo "✅ All required files present!"
    echo ""
    echo "📍 Extension location: $(pwd)/dist"
    echo ""
    echo "Next steps:"
    echo "1. Open Chrome: chrome://extensions/"
    echo "2. Enable 'Developer mode'"
    echo "3. Click 'Remove' on old Speedy AI (if exists)"
    echo "4. Click 'Load unpacked'"
    echo "5. Select: $(pwd)/dist"
    echo ""
    echo "Test: Press Cmd+K on any webpage!"
else
    echo "❌ Build incomplete. Run: npm run build"
    exit 1
fi
