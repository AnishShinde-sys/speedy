// Speedy AI Content Script - WXT Entry Point
export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  
  main() {
    // Browser compatibility layer
    const browserAPI = typeof window.browser !== 'undefined' ? window.browser : (self as any).chrome;
    
    console.log("🚀 [Content] ===== SPEEDY AI CONTENT SCRIPT LOADED =====");
    console.log("🚀 [Content] URL:", window.location.href);
    console.log("🚀 [Content] Timestamp:", new Date().toISOString());
    
    // Check if already initialized to prevent multiple injections
    if ((window as any).__speedyAiInitialized) {
      console.log("⏭️ Speedy AI Content Script already initialized, skipping");
      return;
    }
    (window as any).__speedyAiInitialized = true;
    
    // We handle all content script logic here in WXT
    // No need to load external scripts
    
    // Also set up message handlers in the content script context
    setupMessageHandlers();
    
    // Listen for messages from overlay
    setupOverlayBridge();
    
function setupMessageHandlers() {
    console.log('🔧 [Content] Setting up message handlers...');
      
      if (browserAPI && browserAPI.runtime) {
        browserAPI.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
            console.log('📨 [Content] ===== MESSAGE RECEIVED =====');
            console.log('📨 [Content] Message type:', message.type);
          
            handleMessage(message, sendResponse);
            return true; // Keep message channel open for async response
        });
        console.log('✅ [Content] Message listener registered');
    }
}

    async function handleMessage(message: any, sendResponse: any) {
    switch (message.type) {
        case "get_page_content":
          // Will be handled by injected script
            break;
            
        case "get_selected_text":
            try {
                const selection = window.getSelection();
            const text = selection ? selection.toString() : '';
                sendResponse({
                    success: true,
                    text: text
                });
          } catch (error: any) {
                sendResponse({
                    success: false,
                    error: error.message
                });
            }
            break;
            
        case "toggle_overlay":
          console.log('🎯 [Content] Toggle overlay command');
            window.postMessage({
                type: 'SPEEDY_TOGGLE_OVERLAY'
            }, '*');
            sendResponse({ success: true });
            break;
            
        case "SCREENSHOT_CAPTURED":
            console.log('📸 [Content] Screenshot captured, forwarding to overlay');
            window.postMessage({
                type: 'SPEEDY_SCREENSHOT_CAPTURED',
                dataUrl: message.dataUrl,
                imageData: message.imageData
            }, '*');
            sendResponse({ success: true });
            break;
            
        default:
            sendResponse({ success: false, error: "Unknown message type" });
    }
}

    function setupOverlayBridge() {
// Listen for messages from overlay (page context) and relay to background
      window.addEventListener('message', async (event) => {
    // Only accept messages from same window
    if (event.source !== window) return;
    
    // Handle overlay submit
    if (event.data.type === 'SPEEDY_OVERLAY_SUBMIT') {
          // Forward to background
          console.log('💬 [SPEEDY] Message being sent to AI');
        }
        
        // Handle tabs request
        if (event.data.type === 'SPEEDY_GET_TABS') {
          try {
            const response = await browserAPI.runtime.sendMessage({
                        type: 'GET_ALL_TABS'
                    });
                    
                    if (response && response.success) {
                        window.postMessage({
                            type: 'SPEEDY_TABS_RESPONSE',
                            tabs: response.tabs
                        }, '*');
                    }
          } catch (err: any) {
                    console.log('Failed to get tabs:', err.message);
        }
    }
    
    // Handle API requests from overlay
    if (event.data.type === 'SPEEDY_API_REQUEST') {
        const { requestId, method, endpoint, body } = event.data;
        
          try {
            const response = await browserAPI.runtime.sendMessage({
                        type: 'API_REQUEST',
                        method,
                        endpoint,
                        body
                    });
                    
                    // Send response back to overlay
                    window.postMessage({
                        type: 'SPEEDY_API_RESPONSE',
                        requestId,
                        success: response.success,
                        data: response.data,
                        error: response.error
                    }, '*');
          } catch (err: any) {
                    window.postMessage({
                        type: 'SPEEDY_API_RESPONSE',
                        requestId,
                        success: false,
                        error: err.message || 'API request failed'
                    }, '*');
                }
        }
        
        // Handle screenshot capture request
        if (event.data.type === 'SPEEDY_CAPTURE_SCREENSHOT') {
                try {
            const response = await browserAPI.runtime.sendMessage({
                        type: 'CAPTURE_SCREENSHOT'
                    });
                    
            if (!response?.success) {
              console.log('📸 [Content] Screenshot capture failed');
            }
          } catch (err: any) {
            console.log('Screenshot request failed:', err.message);
          }
        }
        
        // Handle overlay state save
        if (event.data.type === 'SPEEDY_SAVE_OVERLAY_STATE') {
          console.log('💾 [Content] Received SPEEDY_SAVE_OVERLAY_STATE request:', event.data.isVisible);                                                                                
          console.log('💾 [Content] Saving to storage:', {
            overlayState: { isVisible: event.data.isVisible, isMinimized: false }
          });
          
          if (browserAPI && browserAPI.storage) {
            await browserAPI.storage.local.set({
              overlayState: {
                isVisible: event.data.isVisible,
                isMinimized: false
              }
            });
            console.log('✅ [Content] State saved successfully');
          }
        }
        
        // Handle overlay state get
        if (event.data.type === 'SPEEDY_GET_OVERLAY_STATE') {
          console.log('📥 [Content] Received SPEEDY_GET_OVERLAY_STATE request');
          
          if (browserAPI && browserAPI.storage) {
            const result = await browserAPI.storage.local.get('overlayState');
            console.log('📤 [Content] Retrieved overlay state from storage:', result);
            
            window.postMessage({
              type: 'SPEEDY_OVERLAY_STATE_RESPONSE',
              state: result.overlayState || { isVisible: false, isMinimized: true }
            }, '*');
          }
        }
      });
    }
    
    // Inject the overlay script
    injectOverlay();
    
    function injectOverlay() {
      // Check if already injected
      if (document.getElementById('speedy-ai-overlay-root')) {
        console.log('⚠️ Overlay already injected');
        return;
      }
      
      // Create container
      const container = document.createElement('div');
      container.id = 'speedy-ai-overlay-root';
      document.body.appendChild(container);
      
      // Load the overlay script
      const overlayScript = document.createElement('script');
      overlayScript.src = browserAPI.runtime.getURL('content-scripts/overlay.js');
      overlayScript.type = 'module';
      (document.head || document.documentElement).appendChild(overlayScript);
      
      console.log('✅ Overlay and FAB injected');
    }
        
        console.log("✅ [Content] Initialization complete");
    }
});
