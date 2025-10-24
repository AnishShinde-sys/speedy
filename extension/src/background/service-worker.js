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
        
      case 'add-screenshot-to-context':
        // Forward screenshot data to overlay/content script
        console.log('📸 [Background] Screenshot captured, forwarding to overlay');
        if (sender.tab?.id) {
          try {
            await browser.tabs.sendMessage(sender.tab.id, {
              type: 'SCREENSHOT_CAPTURED',
              imageData: message.imageData,
              dataUrl: message.dataUrl
            });
            sendResponse({ success: true });
          } catch (error) {
            console.error('[Background] Failed to forward screenshot:', error);
            sendResponse({ success: false, error: error.message });
          }
        }
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

// Capture screenshot of visible tab with region selection
async function handleCaptureScreenshot(tab, sendResponse) {
  try {
    if (!tab || !tab.id) {
      sendResponse({ success: false, error: 'No active tab' });
      return;
    }
    
    // Check if screenshot overlay already exists in the tab
    const [overlayExists] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => !!document.getElementById("screenshot-overlay")
    });

    // If overlay exists, restore the page and exit
    if (overlayExists?.result) {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const restoreFunction = window.__screenshotRestore;
          if (restoreFunction) {
            restoreFunction();
          }
        }
      });
      sendResponse({ success: false, cancelled: true });
      return;
    }

    // Capture the visible tab as PNG
    const screenshotDataUrl = await browser.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 100
    });
    
    // Inject the screenshot selection UI into the page
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: (imageDataUrl) => {
        // Save original scroll position and overflow styles
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalScrollX = window.scrollX;
        const originalScrollY = window.scrollY;

        // ===== UI CREATION FUNCTIONS =====

        // Create full-screen overlay container
        const createOverlay = () => {
          const overlay = document.createElement("div");
          overlay.id = "screenshot-overlay";
          overlay.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: #fff;
            cursor: crosshair;
            margin: 0;
            padding: 0;
          `;
          return overlay;
        };

        // Create screenshot image element
        const createScreenshotImage = () => {
          const img = document.createElement("img");
          img.src = imageDataUrl;
          img.alt = "Screenshot";
          img.style.cssText = `
            width: 100vw;
            height: 100vh;
            object-fit: contain;
            display: block;
            user-select: none;
          `;
          return img;
        };

        // Create gradient overlay at top
        const createGradientOverlay = () => {
          const gradient = document.createElement("div");
          gradient.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 120px;
            background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
            z-index: 1000000;
            pointer-events: none;
          `;
          return gradient;
        };

        // Create instruction box
        const createInstructionBox = () => {
          const box = document.createElement("div");
          box.id = "instruction-box";
          box.innerHTML = `
            <span style="color:#374151;font-family:ui-sans-serif,system-ui,sans-serif;">
              Select a region to capture • Press ESC to cancel
            </span>
          `;
          box.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(210,210,210,0.6);
            backdrop-filter: blur(3px);
            -webkit-backdrop-filter: blur(3px);
            border-radius: 12px;
            padding: 8px 16px;
            font-size: 12px;
            box-shadow: 0 0 6px rgba(0,0,0,0.08);
            border: 1px solid rgba(0,0,0,0.1);
            z-index: 1000001;
            pointer-events: none;
            display: flex;
            align-items: center;
            font-family: ui-sans-serif,system-ui,sans-serif;
          `;
          return box;
        };

        // Create selection rectangle
        const createSelectionBox = () => {
          const box = document.createElement("div");
          box.style.cssText = `
            position: absolute;
            border: 2px solid #1F4EF3;
            background: rgba(0,123,255,.1);
            pointer-events: none;
            z-index: 1000000;
            border-radius: 12px;
          `;
          return box;
        };

        // Update selection box position and size
        const updateSelectionBox = (
          selectionBox,
          imageElement,
          startX,
          startY,
          currentX,
          currentY
        ) => {
          const imgRect = imageElement.getBoundingClientRect();
          
          // Calculate relative coordinates
          const relativeCurrentX = currentX - imgRect.left;
          const relativeCurrentY = currentY - imgRect.top;
          
          // Calculate top-left corner (minimum of start and current)
          const left = Math.min(startX, relativeCurrentX);
          const top = Math.min(startY, relativeCurrentY);
          
          // Calculate width and height (absolute difference)
          const width = Math.abs(relativeCurrentX - startX);
          const height = Math.abs(relativeCurrentY - startY);
          
          // Update selection box styles
          selectionBox.style.left = left + imgRect.left + "px";
          selectionBox.style.top = top + imgRect.top + "px";
          selectionBox.style.width = width + "px";
          selectionBox.style.height = height + "px";
        };

        // Crop image based on selection
        const cropImage = (
          imageElement,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          imageRect
        ) => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Get natural (original) image dimensions
          const naturalSize = {
            w: imageElement.naturalWidth,
            h: imageElement.naturalHeight
          };
          
          // Calculate scaling factors
          const scaleX = naturalSize.w / imageRect.width;
          const scaleY = naturalSize.h / imageRect.height;
          
          // Convert screen coordinates to image coordinates
          const sourceX = cropX * scaleX;
          const sourceY = cropY * scaleY;
          const sourceWidth = cropWidth * scaleX;
          const sourceHeight = cropHeight * scaleY;
          
          // Set canvas size to cropped dimensions
          canvas.width = sourceWidth;
          canvas.height = sourceHeight;
          
          // Draw cropped region
          ctx?.drawImage(
            imageElement,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            sourceWidth,
            sourceHeight
          );
          
          // Return as base64 PNG data URL
          return canvas.toDataURL("image/png");
        };

        // ===== INITIALIZE UI =====

        const overlay = createOverlay();
        const screenshotImage = createScreenshotImage();
        const gradientOverlay = createGradientOverlay();
        const instructionBox = createInstructionBox();

        // Disable scrolling
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        // Add elements to page
        document.body.appendChild(overlay);
        overlay.appendChild(screenshotImage);
        overlay.appendChild(gradientOverlay);
        overlay.appendChild(instructionBox);

        // ===== STATE VARIABLES =====

        let isSelecting = false;
        let startX = 0;
        let startY = 0;
        let selectionBox = null;

        // ===== KEYBOARD HANDLER =====

        const handleKeyDown = (event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            isSelecting = false;
            if (selectionBox) {
              selectionBox.remove();
              selectionBox = null;
            }
            cleanup();
          }
        };

        document.addEventListener("keydown", handleKeyDown);

        // ===== CLEANUP FUNCTION =====

        const cleanup = () => {
          // Remove selection box
          if (selectionBox) {
            selectionBox.remove();
            selectionBox = null;
          }

          // Remove overlay
          overlay.remove();

          // Restore original styles
          document.body.style.overflow = originalBodyOverflow;
          document.documentElement.style.overflow = originalHtmlOverflow;

          // Restore scroll position
          window.scrollTo(originalScrollX, originalScrollY);

          // Reset state
          isSelecting = false;

          // Remove event listeners
          window.removeEventListener("resize", cleanup);
          resizeObserver?.disconnect();
          document.removeEventListener("keydown", handleKeyDown);

          // Clear restore function
          window.__screenshotRestore = null;
        };

        // Store cleanup function globally for external access
        window.__screenshotRestore = cleanup;

        // ===== MOUSE EVENT HANDLERS =====

        // Mouse down - start selection
        overlay.addEventListener("mousedown", (event) => {
          event.preventDefault();
          isSelecting = true;

          // Hide instruction box
          instructionBox.style.display = "none";

          // Get click position relative to image
          const imgRect = screenshotImage.getBoundingClientRect();
          startX = event.clientX - imgRect.left;
          startY = event.clientY - imgRect.top;

          // Create and add selection box
          selectionBox = createSelectionBox();
          overlay.appendChild(selectionBox);
        });

        // Mouse move - update selection
        document.addEventListener("mousemove", (event) => {
          if (!isSelecting || !selectionBox) return;

          updateSelectionBox(
            selectionBox,
            screenshotImage,
            startX,
            startY,
            event.clientX,
            event.clientY
          );
        });

        // Mouse up - finalize selection and crop
        document.addEventListener("mouseup", (event) => {
          if (!isSelecting || !selectionBox) return;

          isSelecting = false;

          // Calculate final selection bounds
          const imgRect = screenshotImage.getBoundingClientRect();
          const endX = event.clientX - imgRect.left;
          const endY = event.clientY - imgRect.top;

          const cropX = Math.min(startX, endX);
          const cropY = Math.min(startY, endY);
          const cropWidth = Math.abs(endX - startX);
          const cropHeight = Math.abs(endY - startY);

          // Remove selection box
          selectionBox.remove();
          selectionBox = null;

          // Check if selection is too small (accidental click)
          if (cropWidth < 5 && cropHeight < 5) {
            cleanup();
            return;
          }

          // Check minimum size
          if (cropWidth < 10 || cropHeight < 10) {
            return;
          }

          // Crop the image
          const croppedImageDataUrl = cropImage(
            screenshotImage,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            imgRect
          );

          // Extract base64 data (remove "data:image/png;base64," prefix)
          const base64Data = croppedImageDataUrl.split(",")[1];

          // Send to extension background
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
              type: "add-screenshot-to-context",
              imageData: base64Data,
              dataUrl: croppedImageDataUrl
            });
          }

          // Cleanup
          cleanup();
        });

        // ===== WINDOW RESIZE HANDLER =====

        const initialWidth = window.innerWidth;

        // Use ResizeObserver if available
        const resizeObserver = window.ResizeObserver
          ? new ResizeObserver(() => {
              if (window.innerWidth !== initialWidth) {
                cleanup();
              }
            })
          : null;

        resizeObserver?.observe(document.body);

        // Fallback resize listener
        window.addEventListener("resize", cleanup);
      },
      args: [screenshotDataUrl]
    });

    // Return success - actual screenshot will be sent via message
    sendResponse({ success: true, message: 'Screenshot capture initiated' });

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
  // Use localhost for development, production URL for production
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
  // Use localhost for development, production URL for production
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


