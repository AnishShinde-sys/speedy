// Background service worker for Speedy AI Assistant

// Import analytics (PostHog)
import { initAnalytics, trackInstall, trackEvent } from '../utils/analytics.js';

// Browser compatibility layer - use self.browser if available (Firefox with polyfill), else chrome
// Use self to access global scope in both service workers and background pages
var browser = (typeof self.browser !== 'undefined') ? self.browser : chrome;

// Initialize analytics on service worker startup
initAnalytics();

// Handle keyboard shortcuts
console.log('🚀 [Background] Service worker loaded, registering command listener...');

browser.commands.onCommand.addListener(async (command) => {
  console.log('⌨️ [Background] ===== KEYBOARD COMMAND RECEIVED =====');
  console.log('⌨️ [Background] Command:', command);
  console.log('⌨️ [Background] Timestamp:', new Date().toISOString());
  
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    console.log('📋 [Background] Active tabs:', tabs);
    const tab = tabs && tabs.length > 0 ? tabs[0] : null;
    
    if (command === 'toggle-overlay') {
      console.log('🎯 [Background] Toggle overlay command matched!');
      console.log('🎯 [Background] Tab ID:', tab?.id);
      console.log('🎯 [Background] Tab URL:', tab?.url);
      
      if (tab) {
        console.log('✅ [Background] Calling toggleOverlay...');
        await toggleOverlay(tab);
        console.log('✅ [Background] toggleOverlay completed');
      } else {
        console.error('❌ [Background] No active tab found');
      }
    } else {
      console.log('⚠️ [Background] Unknown command:', command);
    }
  } catch (error) {
    console.error('❌ [Background] Error handling command:', error);
    console.error('❌ [Background] Error stack:', error.stack);
  }
});

console.log('✅ [Background] Command listener registered successfully');

// Handle extension icon click (Chrome MV3 uses action, Firefox MV2 uses browserAction)
if (browser.action && browser.action.onClicked) {
  browser.action.onClicked.addListener(async (tab) => {
    // Toggle overlay when clicking the icon
    await toggleOverlay(tab);
  });
} else if (browser.browserAction && browser.browserAction.onClicked) {
  browser.browserAction.onClicked.addListener(async (tab) => {
    // Toggle overlay when clicking the icon (Firefox)
    await toggleOverlay(tab);
  });
}

// Toggle overlay function with content script injection fallback
async function toggleOverlay(tab) {
  console.log('🔄 [Background] toggleOverlay called');
  console.log('🔄 [Background] Tab object:', tab);
  
  if (!tab || !tab.id) {
    console.error('❌ [Background] Invalid tab object');
    return;
  }
  
  console.log('🔄 [Background] Tab ID is valid:', tab.id);
  
  // Don't try to inject on chrome:// or other restricted pages
  const url = tab.url || '';
  console.log('🔄 [Background] Tab URL:', url);
  if (url.startsWith('chrome://') || 
      url.startsWith('chrome-extension://') ||
      url.startsWith('about:')) {
    console.log('Cannot inject content script on restricted page:', url);
    return;
  }
  
  console.log('🎯 [Background] Toggling overlay for tab:', tab.id, url);
  
  try {
    // Try to send message to existing content script
    await browser.tabs.sendMessage(tab.id, { type: 'toggle_overlay' });
  } catch (error) {
    // Content script not loaded, try to inject it
    console.log('Content script not found, injecting...');
    
    try {
      // Inject content script (MV3 for Chrome, MV2 for Firefox)
      if (browser.scripting && browser.scripting.executeScript) {
        // Chrome MV3 way
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content-script.js']
        });
      } else {
        // Firefox MV2 way
        await browser.tabs.executeScript(tab.id, {
          file: 'content/content-script.js'
        });
      }
      
      // Wait a bit for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try sending message again
      await browser.tabs.sendMessage(tab.id, { type: 'toggle_overlay' });
    } catch (injectError) {
      console.error('Failed to inject content script:', injectError);
    }
  }
}

// Handle messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

async function handleMessage(message, sender, sendResponse) {
  try {
    console.log('📨 [Background] Received message:', {
      type: message.type,
      hasMessage: !!message.message,
      selectedTabsCount: message.selectedTabs?.length || 0,
      model: message.model,
      sender: sender.tab?.id
    });
    
    switch (message.type) {
      case 'GET_CURRENT_TAB':
        await handleGetCurrentTab(sendResponse);
        break;
        
      case 'GET_ALL_TABS':
        await handleGetAllTabs(sendResponse);
        break;
        
      case 'EXTRACT_TAB_CONTENT':
        await handleExtractTabContent(message.tabId, sendResponse);
        break;
        
      case 'GET_SELECTED_TEXT':
        await handleGetSelectedText(sender.tab.id, sendResponse);
        break;
        
      case 'CAPTURE_SCREENSHOT':
        await handleCaptureScreenshot(sender.tab, sendResponse);
        break;
        
      case 'API_REQUEST':
        await handleApiRequest(message, sendResponse);
        break;
        
      default:
        console.warn('⚠️ [Background] Unknown message type:', message.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('❌ [Background] Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Get current active tab
async function handleGetCurrentTab(sendResponse) {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs && tabs.length > 0 ? tabs[0] : null;
    
    if (tab) {
      sendResponse({
        success: true,
        tab: {
          id: tab.id,
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl
        }
      });
    } else {
      sendResponse({ success: false, error: 'No active tab found' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Get all tabs
// Helper function to convert favicon to data URL
async function getFaviconAsDataUrl(faviconUrl) {
  if (!faviconUrl) return null;
  if (faviconUrl.startsWith('data:')) {
    return faviconUrl;
  }

  try {
    const url = new URL(faviconUrl);
    const protocol = url.protocol;

    // Skip protocols we can't fetch or convert reliably
    if (!['http:', 'https:'].includes(protocol)) {
      return null;
    }

    // Local dev servers (e.g. localhost) usually block CORS for favicon fetches.
    // Skip conversion so we fall back to the Google favicon service below.
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return null;
    }

    const response = await fetch(faviconUrl, { credentials: 'omit' });
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.debug('⚠️ Skipping favicon conversion:', faviconUrl, error?.message || error);
    return null;
  }
}

async function handleGetAllTabs(sendResponse) {
  try {
    // Get the current active tab in the current window first
    const currentTabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab = currentTabs && currentTabs.length > 0 ? currentTabs[0] : null;
    const currentTabId = currentTab?.id;
    
    console.log('🎯 [Background] Current active tab ID:', currentTabId, 'Title:', currentTab?.title);
    
    // Get all tabs
    const tabs = await browser.tabs.query({});
    
    // Convert favicons to data URLs to bypass CSP
    const tabList = await Promise.all(tabs.map(async tab => {
      let faviconDataUrl = null;
      
      if (tab.favIconUrl) {
        // Try to convert to data URL
        faviconDataUrl = await getFaviconAsDataUrl(tab.favIconUrl);
      }
      
      // Fallback to Google's service
      if (!faviconDataUrl && tab.url) {
        try {
          const urlObj = new URL(tab.url);
          const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
          faviconDataUrl = await getFaviconAsDataUrl(googleFaviconUrl);
        } catch (e) {
          console.error('Failed to get Google favicon for:', tab.url);
        }
      }
      
      const isActive = tab.id === currentTabId;
      if (isActive) {
        console.log('✅ [Background] Marking tab as active:', tab.title);
      }
      
      return {
        id: tab.id,
        title: tab.title,
        url: tab.url,
        favIconUrl: faviconDataUrl || tab.favIconUrl, // Use data URL or original
        active: isActive // Mark only the CURRENT window's active tab as active
      };
    }));
    
    sendResponse({ success: true, tabs: tabList });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Extract content from specific tab
async function handleExtractTabContent(tabId, sendResponse) {
  try {
    // Send message to content script to extract content
    const response = await browser.tabs.sendMessage(tabId, { type: 'get_page_content' });
    
    if (response && response.success) {
      // Extract just the content string from the context object
      const contentString = response.context?.content || '';
      sendResponse({ success: true, content: contentString });
    } else {
      sendResponse({ success: false, error: 'Failed to extract content' });
    }
  } catch (error) {
    console.error('[Background] Error extracting tab content:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Get selected text from tab
async function handleGetSelectedText(tabId, sendResponse) {
  try {
    const response = await browser.tabs.sendMessage(tabId, { type: 'get_selected_text' });
    
    if (response && response.success) {
      sendResponse({ success: true, text: response.text });
    } else {
      sendResponse({ success: false, error: 'No text selected' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Capture screenshot of visible tab
async function handleCaptureScreenshot(tab, sendResponse) {
  try {
    if (!tab || !tab.id) {
      sendResponse({ success: false, error: 'No active tab' });
      return;
    }
    
    // Capture the visible tab
    const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 100
    });
    
    sendResponse({ success: true, dataUrl });
  } catch (error) {
    console.error('[Background] Screenshot capture failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Extract content from a tab
async function extractTabContent(tabId) {
  try {
    // Check if we have MV3 scripting API (Chrome) or need to use MV2 (Firefox)
    if (browser.scripting && browser.scripting.executeScript) {
      // Chrome Manifest V3
      const results = await browser.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          // Extract page content
          const title = document.title;
          const url = window.location.href;
          
          // Get main content (remove scripts, styles, etc.)
          const clone = document.body.cloneNode(true);
          const scripts = clone.querySelectorAll('script, style, noscript');
          scripts.forEach(el => el.remove());
          
          // Get text content
          const text = clone.innerText || clone.textContent || '';
          
          // Clean up whitespace
          const cleanText = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
          
          return {
            title,
            url,
            content: cleanText.substring(0, 10000) // Limit to 10k chars
          };
        }
      });
      return results[0]?.result || null;
    } else {
      // Firefox MV2
      const results = await browser.tabs.executeScript(tabId, {
        code: `
          (() => {
            const title = document.title;
            const url = window.location.href;
            
            const clone = document.body.cloneNode(true);
            const scripts = clone.querySelectorAll('script, style, noscript');
            scripts.forEach(el => el.remove());
            
            const text = clone.innerText || clone.textContent || '';
            
            const cleanText = text
              .split('\\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .join('\\n');
            
            return {
              title,
              url,
              content: cleanText.substring(0, 10000)
            };
          })()
        `
      });
      return results[0] || null;
    }
  } catch (error) {
    console.error(`[Background] Error extracting content from tab ${tabId}:`, error);
    return null;
  }
}

// Handle API requests (proxy to avoid CSP issues)
async function handleApiRequest(message, sendResponse) {
  const { method, endpoint, body } = message;
  const API_BASE_URL = 'http://localhost:3001';
  
  try {
    console.log(`🌐 [Background] API ${method} ${endpoint}`);
    
    const fetchOptions = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    sendResponse({ success: true, data });
  } catch (error) {
    console.error('❌ [Background] API request failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle streaming API requests
async function handleStreamingApiRequest(message, sendCallback) {
  const { method, endpoint, body } = message;
  const API_BASE_URL = 'http://localhost:3001';
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      sendCallback({ type: 'chunk', data: chunk });
    }
    
    sendCallback({ type: 'done' });
  } catch (error) {
    console.error('❌ [Background] Streaming API request failed:', error);
    sendCallback({ type: 'error', error: error.message });
  }
}

console.log('✅ Speedy AI Background Service Worker loaded');


