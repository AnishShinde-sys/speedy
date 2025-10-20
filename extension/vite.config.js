import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

export default defineConfig({
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        if (!existsSync(dist)) {
          mkdirSync(dist, { recursive: true });
        }
        copyFileSync(
          resolve(__dirname, 'public/manifest.json'),
          resolve(dist, 'manifest.json')
        );
      }
    },
    {
      name: 'wrap-content-script',
      closeBundle() {
        // Wrap content script in IIFE to prevent ES module issues
        const contentScriptPath = resolve(__dirname, 'dist/content/content-script.js');
        if (existsSync(contentScriptPath)) {
          let content = readFileSync(contentScriptPath, 'utf-8');
          // Ensure it's wrapped in IIFE if not already
          if (!content.startsWith('(function()')) {
            content = `(function() {\n${content}\n})();`;
          }
          writeFileSync(contentScriptPath, content);
          console.log('✅ Content script wrapped and verified');
        } else {
          console.error('❌ ERROR: content-script.js not found!');
        }
      }
    },
    {
      name: 'verify-build',
      closeBundle() {
        // Verify all required files exist
        const dist = resolve(__dirname, 'dist');
        const requiredFiles = [
          'manifest.json',
          'background/service-worker.js',
          'content/content-script.js',
          'overlay/overlay.js'
        ];
        
        console.log('\n🔍 Verifying build...');
        let allGood = true;
        
        requiredFiles.forEach(file => {
          const filePath = resolve(dist, file);
          if (existsSync(filePath)) {
            console.log(`✅ ${file}`);
          } else {
            console.error(`❌ MISSING: ${file}`);
            allGood = false;
          }
        });
        
        if (allGood) {
          console.log('\n✅ BUILD VERIFIED - All files present!\n');
        } else {
          console.error('\n❌ BUILD FAILED - Missing files!\n');
          process.exit(1);
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.js'),
        'content/content-script': resolve(__dirname, 'src/content/content-script.js'),
        'overlay/overlay': resolve(__dirname, 'src/overlay/overlay.js')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
