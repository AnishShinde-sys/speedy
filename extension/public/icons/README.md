# Extension Icons

Please add the following icon files to this directory:

- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

You can create simple icons using any image editor or online tool.

For a quick start, you can use a free tool like:
- https://www.favicon-generator.org/
- https://www.canva.com/

Or create them programmatically with a tool like ImageMagick:

```bash
# Create a simple colored circle icon
convert -size 128x128 xc:transparent -fill '#10A37F' -draw 'circle 64,64 64,0' icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

The extension will work without icons, but they make it look more professional in the Chrome toolbar and extensions page.


