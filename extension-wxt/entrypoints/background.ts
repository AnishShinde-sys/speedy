// Background service worker for Speedy AI Assistant

// Backend API URL - Render backend
const API_BASE_URL = 'https://speedy-09j8.onrender.com';

export default defineBackground(() => {
  // Import analytics (PostHog)
  // Note: We'll handle this differently in WXT
  
  // WXT provides browser global automatically
  console.log('🚀 [Background] Service worker loaded');
  
  // Initialize analytics
  try {
    // Dynamic import to avoid build-time issues
    import('../utils/analytics.js').then(analytics => {
      analytics.initAnalytics();
    }).catch(err => {
      console.log('Analytics not available:', err.message);
    });
  } catch (e) {
    console.log('Analytics initialization skipped');
  }
  
  // Handle keyboard shortcuts
  browser.commands.onCommand.addListener(async (command) => {
    console.log('⌨️ [Background] ===== KEYBOARD COMMAND RECEIVED =====');
    console.log('⌨️ [Background] Command:', command);
    console.log('⌨️ [Background] Timestamp:', new Date().toISOString());
    
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const tab = tabs && tabs.length > 0 ? tabs[0] : null;
      
      if (command === 'toggle-overlay') {
        console.log('🎯 [Background] Toggle overlay command matched!');
        
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
    }
  });
  
  // Handle extension icon click
  if (browser.action && browser.action.onClicked) {
    browser.action.onClicked.addListener(async (tab) => {
      await toggleOverlay(tab);
    });
  }
  
  // Toggle overlay function with content script injection fallback
  async function toggleOverlay(tab: any) {
    if (!tab || !tab.id) {
      console.error('❌ [Background] Invalid tab object');
      return;
    }
    
    // Don't try to inject on restricted pages
    const url = tab.url || '';
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
        if (browser.scripting && browser.scripting.executeScript) {
          // Chrome MV3 way
          await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-scripts/content.js']
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
  browser.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
    handleMessage(message, sender, sendResponse);
    return true; // Keep message channel open for async response
  });
  
  async function handleMessage(message: any, sender: any, sendResponse: any) {
    try {
      console.log('📨 [Background] Received message:', {
        type: message.type,
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
            } catch (error: any) {
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
    } catch (error: any) {
      console.error('❌ [Background] Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  // Get current active tab
  async function handleGetCurrentTab(sendResponse: any) {
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
    } catch (error: any) {
      sendResponse({ success: false, error: error.message });
    }
  }
  
  // Helper function to convert favicon to data URL
  async function getFaviconAsDataUrl(faviconUrl: string): Promise<string | null> {
    if (!faviconUrl) return null;
    if (faviconUrl.startsWith('data:')) {
      return faviconUrl;
    }
  
    try {
      const url = new URL(faviconUrl);
      const protocol = url.protocol;
  
      if (!['http:', 'https:'].includes(protocol)) {
        return null;
      }
  
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
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      return null;
    }
  }
  
  // Get all tabs
  async function handleGetAllTabs(sendResponse: any) {
    try {
      const currentTabs = await browser.tabs.query({ active: true, currentWindow: true });
      const currentTab = currentTabs && currentTabs.length > 0 ? currentTabs[0] : null;
      const currentTabId = currentTab?.id;
      
      const tabs = await browser.tabs.query({});
      
      const tabList = await Promise.all(tabs.map(async (tab: any) => {
        let faviconDataUrl = null;
        
        if (tab.favIconUrl) {
          faviconDataUrl = await getFaviconAsDataUrl(tab.favIconUrl);
        }
        
        if (!faviconDataUrl && tab.url) {
          try {
            const urlObj = new URL(tab.url);
            const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
            faviconDataUrl = await getFaviconAsDataUrl(googleFaviconUrl);
          } catch (e) {
            // Ignore
          }
        }
        
        return {
          id: tab.id,
          title: tab.title,
          url: tab.url,
          favIconUrl: faviconDataUrl || tab.favIconUrl,
          active: tab.id === currentTabId
        };
      }));
      
      sendResponse({ success: true, tabs: tabList });
    } catch (error: any) {
      sendResponse({ success: false, error: error.message });
    }
  }
  
  // Extract content from specific tab
  async function handleExtractTabContent(tabId: number, sendResponse: any) {
    try {
      const response = await browser.tabs.sendMessage(tabId, { type: 'get_page_content' });
      
      if (response && response.success) {
        const contentString = response.context?.content || '';
        sendResponse({ success: true, content: contentString });
      } else {
        sendResponse({ success: false, error: 'Failed to extract content' });
      }
    } catch (error: any) {
      console.error('[Background] Error extracting tab content:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  // Get selected text from tab
  async function handleGetSelectedText(tabId: number, sendResponse: any) {
    try {
      const response = await browser.tabs.sendMessage(tabId, { type: 'get_selected_text' });
      
      if (response && response.success) {
        sendResponse({ success: true, text: response.text });
      } else {
        sendResponse({ success: false, error: 'No text selected' });
      }
    } catch (error: any) {
      sendResponse({ success: false, error: error.message });
    }
  }
  
  // Capture screenshot of visible tab with region selection
  async function handleCaptureScreenshot(tab: any, sendResponse: any) {
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
            const restoreFunction = (window as any).__screenshotRestore;
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
        format: 'png' as any
      });
      
      // Inject the screenshot selection UI into the page
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: (imageDataUrl: string) => {
          // [Screenshot UI code will be inserted here - keeping original implementation]
          // This is a large block of code, so I'll include the essential parts
          
          const originalBodyOverflow = document.body.style.overflow;
          const originalHtmlOverflow = document.documentElement.style.overflow;
          const originalScrollX = window.scrollX;
          const originalScrollY = window.scrollY;
  
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
              border-radius: 12px;
              padding: 8px 16px;
              font-size: 12px;
              z-index: 1000001;
              pointer-events: none;
            `;
            return box;
          };
  
          const overlay = createOverlay();
          const screenshotImage = createScreenshotImage();
          const instructionBox = createInstructionBox();
  
          document.body.style.overflow = "hidden";
          document.documentElement.style.overflow = "hidden";
  
          document.body.appendChild(overlay);
          overlay.appendChild(screenshotImage);
          overlay.appendChild(instructionBox);
  
          let isSelecting = false;
          let startX = 0;
          let startY = 0;
          let selectionBox: HTMLElement | null = null;
  
          const cleanup = () => {
            if (selectionBox) selectionBox.remove();
            overlay.remove();
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
            window.scrollTo(originalScrollX, originalScrollY);
            (window as any).__screenshotRestore = null;
          };
  
          (window as any).__screenshotRestore = cleanup;
  
          overlay.addEventListener("mousedown", (event) => {
            event.preventDefault();
            isSelecting = true;
            instructionBox.style.display = "none";
            const imgRect = screenshotImage.getBoundingClientRect();
            startX = event.clientX - imgRect.left;
            startY = event.clientY - imgRect.top;
            selectionBox = document.createElement("div");
            selectionBox.style.cssText = `
              position: absolute;
              border: 2px solid #1F4EF3;
              background: rgba(0,123,255,.1);
              pointer-events: none;
              z-index: 1000000;
              border-radius: 12px;
            `;
            overlay.appendChild(selectionBox);
          });
  
          document.addEventListener("mousemove", (event) => {
            if (!isSelecting || !selectionBox) return;
            
            const imgRect = screenshotImage.getBoundingClientRect();
            const currentX = event.clientX - imgRect.left;
            const currentY = event.clientY - imgRect.top;
            
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            
            selectionBox.style.left = (left + imgRect.left) + "px";
            selectionBox.style.top = (top + imgRect.top) + "px";
            selectionBox.style.width = width + "px";
            selectionBox.style.height = height + "px";
          });
  
          document.addEventListener("mouseup", (event) => {
            if (!isSelecting || !selectionBox) return;
            isSelecting = false;
  
            const imgRect = screenshotImage.getBoundingClientRect();
            const endX = event.clientX - imgRect.left;
            const endY = event.clientY - imgRect.top;
  
            const cropX = Math.min(startX, endX);
            const cropY = Math.min(startY, endY);
            const cropWidth = Math.abs(endX - startX);
            const cropHeight = Math.abs(endY - startY);
  
            selectionBox.remove();
            selectionBox = null;
  
            if (cropWidth < 10 || cropHeight < 10) {
              cleanup();
              return;
            }
  
            // Crop the image
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const scaleX = screenshotImage.naturalWidth / imgRect.width;
            const scaleY = screenshotImage.naturalHeight / imgRect.height;
            canvas.width = cropWidth * scaleX;
            canvas.height = cropHeight * scaleY;
            ctx?.drawImage(
              screenshotImage,
              cropX * scaleX,
              cropY * scaleY,
              canvas.width,
              canvas.height,
              0,
              0,
              canvas.width,
              canvas.height
            );
  
            const croppedImageDataUrl = canvas.toDataURL("image/png");
            const base64Data = croppedImageDataUrl.split(",")[1];
  
            if (typeof browser !== 'undefined' && browser.runtime) {
              browser.runtime.sendMessage({
                type: "add-screenshot-to-context",
                imageData: base64Data,
                dataUrl: croppedImageDataUrl
              });
            }
  
            cleanup();
          });
  
          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
              cleanup();
            }
          });
        },
        args: [screenshotDataUrl]
      });
  
      sendResponse({ success: true, message: 'Screenshot capture initiated' });
  
    } catch (error: any) {
      console.error('[Background] Screenshot capture failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  // Handle API requests (proxy to avoid CSP issues)
  async function handleApiRequest(message: any, sendResponse: any) {
    const { method, endpoint, body } = message;
    
    try {
      console.log(`🌐 [Background] API ${method} ${endpoint}`);
      
      const fetchOptions: RequestInit = {
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
    } catch (error: any) {
      console.error('❌ [Background] API request failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  console.log('✅ Speedy AI Background Service Worker loaded');
});
