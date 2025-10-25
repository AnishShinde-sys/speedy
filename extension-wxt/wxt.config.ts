import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Speedy AI Assistant',
    description: 'AI-powered browser assistant with context-aware chat',
    version: '1.0.0',
    permissions: ['storage', 'tabs', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>'],
    commands: {
      'toggle-overlay': {
        suggested_key: {
          default: 'Ctrl+Shift+Y',
          mac: 'Command+Shift+Y'
        },
        description: 'Toggle Speedy AI overlay'
      }
    },
    action: {
      default_icon: {
        '16': 'icons/icon16.png',
        '48': 'icons/icon48.png',
        '128': 'icons/icon128.png'
      },
      default_title: 'Toggle Speedy AI'
    },
    icons: {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png'
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content-scripts/content.js'],
        run_at: 'document_end'
      }
    ],
    web_accessible_resources: [
      {
        resources: ['content-scripts/overlay.js', 'content-scripts/fab.js'],
        matches: ['<all_urls>']
      }
    ]
  },
});
