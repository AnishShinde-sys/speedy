// Background service worker for Speedy AI Assistant

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (command === 'toggle-overlay') {
    // Cmd+K - Toggle overlay for quick input and chat
    if (tab) {
      await toggleOverlay(tab);
    }
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  // Toggle overlay when clicking the icon
  await toggleOverlay(tab);
});

// Toggle overlay function with content script injection fallback
async function toggleOverlay(tab) {
  // Don't try to inject on chrome:// or other restricted pages
  if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
    console.log('Cannot inject content script on restricted page:', tab.url);
    return;
  }
  
  try {
    // Try to send message to existing content script
    await chrome.tabs.sendMessage(tab.id, { type: 'toggle_overlay' });
  } catch (error) {
    // Content script not loaded, try to inject it
    console.log('Content script not found, injecting...');
    
    try {
      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content-script.js']
      });
      
      // Wait a bit for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try sending message again
      await chrome.tabs.sendMessage(tab.id, { type: 'toggle_overlay' });
    } catch (injectError) {
      console.error('Failed to inject content script:', injectError);
    }
  }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
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
  try {
    const response = await fetch(faviconUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to fetch favicon:', faviconUrl, error);
    return null;
  }
}

async function handleGetAllTabs(sendResponse) {
  try {
    const tabs = await chrome.tabs.query({});
    
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
      
      return {
        id: tab.id,
        title: tab.title,
        url: tab.url,
        favIconUrl: faviconDataUrl || tab.favIconUrl, // Use data URL or original
        active: tab.active
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
    const response = await chrome.tabs.sendMessage(tabId, { type: 'get_page_content' });
    
    if (response && response.success) {
      sendResponse({ success: true, content: response.context });
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
    const response = await chrome.tabs.sendMessage(tabId, { type: 'get_selected_text' });
    
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
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
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
    const results = await chrome.scripting.executeScript({
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
  } catch (error) {
    console.error(`[Background] Error extracting content from tab ${tabId}:`, error);
    return null;
  }
}

console.log('✅ Speedy AI Background Service Worker loaded');


