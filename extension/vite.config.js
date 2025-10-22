import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, cpSync, readFileSync, writeFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  // Determine which browser we're building for based on mode
  const isFirefox = mode === 'firefox';
  const manifestName = isFirefox ? 'manifest-firefox.json' : 'manifest-chrome.json';
  
  console.log(`\n🎯 Building for: ${isFirefox ? 'Firefox' : 'Chrome'}\n`);
  
  return {
    plugins: [
      {
        name: 'copy-manifest-and-assets',
        closeBundle() {
          const dist = resolve(__dirname, 'dist');
          
          // Copy the appropriate manifest file
          const manifestSource = resolve(__dirname, 'public', manifestName);
          const manifestDest = resolve(dist, 'manifest.json');
          
          if (existsSync(manifestSource)) {
            copyFileSync(manifestSource, manifestDest);
            console.log(`✅ Copied ${manifestName} to manifest.json`);
          } else {
            // Fallback to default manifest.json
            const defaultManifest = resolve(__dirname, 'public/manifest.json');
            if (existsSync(defaultManifest)) {
              copyFileSync(defaultManifest, manifestDest);
              console.log(`✅ Copied default manifest.json`);
            }
          }
          
          // For Firefox, copy the browser polyfill
          if (isFirefox) {
            const polyfillSource = resolve(__dirname, 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js');
            const polyfillDest = resolve(dist, 'browser-polyfill.min.js');
            
            if (existsSync(polyfillSource)) {
              copyFileSync(polyfillSource, polyfillDest);
              console.log('✅ Copied browser-polyfill.min.js for Firefox');
            }
          }
          
          // Copy icons folder
          const iconsSource = resolve(__dirname, 'public/icons');
          const iconsDest = resolve(dist, 'icons');
          if (existsSync(iconsSource)) {
            if (!existsSync(iconsDest)) {
              mkdirSync(iconsDest, { recursive: true });
            }
            cpSync(iconsSource, iconsDest, { recursive: true });
            console.log('✅ Copied icons folder');
          }
        }
      },
      {
        name: 'wrap-in-iife',
        closeBundle() {
          const dist = resolve(__dirname, 'dist');
          
          // Wrap each file in IIFE (except Firefox background script)
          const files = [
            'background/service-worker.js',
            'content/content-script.js',
            'overlay/overlay.js'
          ];
          
          files.forEach(file => {
            const filePath = resolve(dist, file);
            if (existsSync(filePath)) {
              let content = readFileSync(filePath, 'utf-8');
              
              // Remove ES module syntax
              content = content.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '');
              content = content.replace(/^export\s+.*?$/gm, '');
              
              // For Firefox background scripts, don't wrap in IIFE to preserve global browser object
              const shouldWrap = !(isFirefox && file === 'background/service-worker.js');
              
              // Wrap in IIFE if not already wrapped (except Firefox background)
              if (shouldWrap && !content.trim().startsWith('(function()') && !content.trim().startsWith('(()')) {
                content = `(function() {\n'use strict';\n${content}\n})();`;
                console.log(`✅ Wrapped ${file} in IIFE`);
              } else if (!shouldWrap) {
                console.log(`⏭️ Skipped wrapping ${file} (Firefox background script)`);
              }
              
              writeFileSync(filePath, content);
            }
          });
        }
      }
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          'background/service-worker': resolve(__dirname, 'src/background/service-worker.js'),
          'content/content-script': resolve(__dirname, 'src/content/content-script.js'),
          'overlay/overlay': resolve(__dirname, 'src/overlay/overlay.js')
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name]-[hash].js',
          format: 'es',  // Use ES modules format for the build
          inlineDynamicImports: false,
          manualChunks: undefined  // Disable code splitting
        }
      }
    }
  };
});