// Speedy AI Content Script
// Content extraction and overlay management for browser extension

"use strict";

// Browser compatibility layer - use window.browser if available (Firefox with polyfill), else chrome
var browser = (typeof window.browser !== 'undefined') ? window.browser : chrome;

// =======================
// 1. VIEWPORT MARKING FUNCTIONS
// =======================

// Check if element is visible in viewport
function isElementInViewport(element, offset = 0) {
    try {
        const parent = element.parentElement;
        if (!parent) return false;
        
        const styles = window.getComputedStyle(parent);
        if (styles.display === "none" || styles.visibility === "hidden" || styles.opacity === "0") {
            return false;
        }
        
        const range = document.createRange();
        range.selectNodeContents(element);
        const rects = range.getClientRects();
        
        if (!rects || rects.length === 0) return false;
        
        for (const rect of rects) {
            if (rect.width === 0 || rect.height === 0) continue;
            if (rect.bottom < -offset || rect.top > window.innerHeight + offset) continue;
            if (rect.right < -offset || rect.left > window.innerWidth + offset) continue;
            return true;
        }
    } catch {}
    return false;
}

// Clean up viewport markers
function cleanupViewportMarkers() {
    document.querySelectorAll('.dex-viewport').forEach(elem => {
        elem.classList.remove('dex-viewport');
    });
    
    const startMarker = document.getElementById('dex-viewport-start');
    if (startMarker) startMarker.remove();
    
    const endMarker = document.getElementById('dex-viewport-end');
    if (endMarker) endMarker.remove();
    
    document.querySelectorAll('[data-marker-type="viewport-start"]').forEach(elem => elem.remove());
    document.querySelectorAll('[data-marker-type="viewport-end"]').forEach(elem => elem.remove());
}

// Mark visible elements in viewport
function markViewportElements(offset = 0) {
    cleanupViewportMarkers();
    
    let firstElement = null;
    let lastElement = null;
    
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            const text = node.textContent?.trim();
            const parent = node.parentElement;
            
            if (parent) {
                const tagName = parent.tagName.toLowerCase();
                if (tagName === "script" || tagName === "style" || tagName === "code" || tagName === "pre") {
                    return NodeFilter.FILTER_REJECT;
                }
                
                const styles = window.getComputedStyle(parent);
                if (styles.display === "none" || styles.visibility === "hidden") {
                    return NodeFilter.FILTER_REJECT;
                }
            }
            
            return text ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });
    
    let node;
    while (node = walker.nextNode()) {
        if (isElementInViewport(node, offset)) {
            const parent = node.parentElement;
            if (parent && !parent.classList.contains('dex-viewport')) {
                parent.classList.add('dex-viewport');
                if (!firstElement) firstElement = parent;
                lastElement = parent;
            }
        }
    }
    
    // Add viewport markers
    if (firstElement && lastElement) {
        const startMarker = document.createElement('div');
        startMarker.id = 'dex-viewport-start';
        startMarker.className = 'dex-viewport-marker-start';
        startMarker.style.display = 'none';
        startMarker.setAttribute('data-marker-type', 'viewport-start');
        
        const endMarker = document.createElement('div');
        endMarker.id = 'dex-viewport-end';
        endMarker.className = 'dex-viewport-marker-end';
        endMarker.style.display = 'none';
        endMarker.setAttribute('data-marker-type', 'viewport-end');
        
        firstElement.parentNode?.insertBefore(startMarker, firstElement);
        if (lastElement.nextSibling) {
            lastElement.parentNode?.insertBefore(endMarker, lastElement.nextSibling);
        } else {
            lastElement.parentNode?.appendChild(endMarker);
        }
    }
}

// =======================
// 2. CONTENT EXTRACTION (NO LIMITS)
// =======================

// Extract metadata from the page
function extractMetadata(url) {
    const metadata = {};
    
    // Extract meta tags
    const description = document.querySelector('meta[name="description"]')?.content;
    if (description) metadata.description = description;
    
    const keywords = document.querySelector('meta[name="keywords"]')?.content;
    if (keywords) metadata.keywords = keywords;
    
    const author = document.querySelector('meta[name="author"]')?.content;
    if (author) metadata.author = author;
    
    // Extract Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
    if (ogTitle) metadata.ogTitle = ogTitle;
    
    const ogDescription = document.querySelector('meta[property="og:description"]')?.content;
    if (ogDescription) metadata.ogDescription = ogDescription;
    
    const ogImage = document.querySelector('meta[property="og:image"]')?.content;
    if (ogImage) metadata.ogImage = ogImage;
    
    // Extract Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.content;
    if (twitterTitle) metadata.twitterTitle = twitterTitle;
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')?.content;
    if (twitterDescription) metadata.twitterDescription = twitterDescription;
    
    return metadata;
}

// Main function to extract page content (NO LIMITS!)
async function extractPageContent() {
    const url = window.location.href;
    const title = document.title;
    
    console.log("📄 [SPEEDY] Extracting content from:", title);
    
    try {
        markViewportElements();
    } catch (error) {
        console.error("[content] Error marking viewport elements:", error);
    }
    
    // Extract ALL visible text (no limits)
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                
                const tagName = parent.tagName.toLowerCase();
                if (tagName === "script" || 
                    tagName === "style" || 
                    tagName === "noscript") {
                    return NodeFilter.FILTER_REJECT;
                }
                
                const styles = window.getComputedStyle(parent);
                if (styles.display === "none" || 
                    styles.visibility === "hidden") {
                    return NodeFilter.FILTER_REJECT;
                }
                
                const text = node.textContent?.trim();
                return text ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        }
    );
    
    const textParts = [];
    let node;
    while (node = walker.nextNode()) {
        textParts.push(node.textContent.trim());
    }
    
    const content = textParts.join(" ");
    
    try {
        cleanupViewportMarkers();
    } catch (error) {
        console.error("[content] Error cleaning up viewport markers:", error);
    }
    
    const result = {
        url: url,
        title: title,
        content: content,
        metadata: extractMetadata(url)
    };
    
    console.log("✅ [SPEEDY] Content extracted:", content.length, "chars");
    console.log("📄 [SPEEDY] Extracted content:\n", content);
    
    return result;
}

// =======================
// 3. TEXT SEARCH & HIGHLIGHT
// =======================

// Highlight first occurrence of text in the page
function highlightFirstText(options) {
    const text = (options?.text || "").trim();
    const indexColor = options?.indexColor || "#ff9813";
    
    if (!text) return false;
    
    // Clear any existing highlights
    clearHighlights();
    
    const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "MATH"]);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!(node.nodeValue || "").trim()) {
                return NodeFilter.FILTER_REJECT;
            }
            
            let parent = node.parentNode;
            while (parent && parent !== document.body) {
                if (skipTags.has(parent.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                parent = parent.parentNode;
            }
            
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    
    let node;
    while (node = walker.nextNode()) {
        const nodeText = node.nodeValue || "";
        const index = nodeText.toLowerCase().indexOf(text.toLowerCase());
        
        if (index !== -1) {
            // Found the text, highlight it
            const parent = node.parentElement;
            if (parent) {
                const span = document.createElement('span');
                span.style.backgroundColor = indexColor;
                span.style.color = 'black';
                span.style.fontWeight = 'bold';
                
                const textBefore = document.createTextNode(nodeText.substring(0, index));
                const textHighlight = document.createTextNode(nodeText.substring(index, index + text.length));
                const textAfter = document.createTextNode(nodeText.substring(index + text.length));
                
                span.appendChild(textHighlight);
                
                parent.insertBefore(textBefore, node);
                parent.insertBefore(span, node);
                parent.insertBefore(textAfter, node);
                parent.removeChild(node);
                
                // Scroll into view
                span.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                return true;
            }
        }
    }
    
    return false;
}

function clearHighlights() {
    // Implementation to clear existing highlights
    document.querySelectorAll('span[style*="background"]').forEach(span => {
        if (span.style.backgroundColor && span.style.fontWeight === 'bold') {
            const text = span.textContent;
            const textNode = document.createTextNode(text);
            span.parentNode?.replaceChild(textNode, span);
        }
    });
}

// =======================
// 4. MESSAGE HANDLERS
// =======================

// Handle messages from extension
function setupMessageHandlers() {
    console.log('🔧 [Content] Setting up message handlers...');
    if (browser && browser.runtime) {
        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('📨 [Content] ===== MESSAGE RECEIVED =====');
            console.log('📨 [Content] Message type:', message.type);
            console.log('📨 [Content] Full message:', message);
            console.log('📨 [Content] Sender:', sender);
            handleMessage(message, sendResponse);
            return true; // Keep message channel open for async response
        });
        console.log('✅ [Content] Message listener registered');
    } else {
        console.error('❌ [Content] browser.runtime not available!');
    }
}

async function handleMessage(message, sendResponse) {
    switch (message.type) {
        case "get_page_content":
            try {
                const content = await extractPageContent();
                sendResponse({
                    success: true,
                    context: content
                });
            } catch (error) {
                console.error("❌ [SPEEDY] get_page_content failed", error);
                sendResponse({
                    success: false,
                    error: error.message
                });
            }
            break;
            
        case "get_selected_text":
            try {
                const selection = window.getSelection();
                const text = selection ? selection.toString().trim() : '';
                sendResponse({
                    success: true,
                    text: text
                });
            } catch (error) {
                sendResponse({
                    success: false,
                    error: error.message
                });
            }
            break;
            
        case "STATE_CHANGED":
            // Handle state changes from background
            handleStateChange(message.data);
            sendResponse({ success: true });
            break;
            
        case "toggle-launcher":
            window.dispatchEvent(new CustomEvent("toggle-launcher"));
            sendResponse({ success: true });
            break;
            
        case "toggle-custom-sidebar":
            window.dispatchEvent(new CustomEvent("toggle-sidebar-visibility"));
            sendResponse({ success: true });
            break;
            
        case "toggle_overlay":
            console.log('🎯 [Content] ===== TOGGLE_OVERLAY MATCHED =====');
            console.log('🎯 [Content] Forwarding to overlay via window.postMessage');
            // Notify overlay to toggle visibility
            window.postMessage({
                type: 'SPEEDY_TOGGLE_OVERLAY'
            }, '*');
            console.log('✅ [Content] Message posted to window');
            sendResponse({ success: true });
            console.log('✅ [Content] Response sent back to background');
            break;
            
        case "insert_text_at_cursor":
            insertTextAtCursor(message.text);
            sendResponse({ success: true });
            break;
            
        case "dex-highlight-first-text":
            try {
                const { text, indexColor } = message.payload || {};
                const found = highlightFirstText({
                    text: typeof text === "string" ? text : "",
                    indexColor: typeof indexColor === "string" ? indexColor : "#ff9813"
                });
                sendResponse({ success: true, found: found });
            } catch {
                sendResponse({ success: false, found: false });
            }
            break;
            
        case "SCREENSHOT_CAPTURED":
            console.log('📸 [Content] Screenshot captured, forwarding to overlay');
            // Forward screenshot to overlay
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

// Insert text at current cursor position
function insertTextAtCursor(text) {
    const activeElement = document.activeElement;
    
    if (activeElement && "value" in activeElement) {
        // Input or textarea element
        const start = activeElement.selectionStart || 0;
        const end = activeElement.selectionEnd || 0;
        const value = activeElement.value;
        const newValue = value.substring(0, start) + text + value.substring(end);
        
        activeElement.value = newValue;
        activeElement.selectionStart = start + text.length;
        activeElement.selectionEnd = start + text.length;
    } else if (activeElement && activeElement.isContentEditable) {
        // Content editable element
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            range.collapse(false);
        }
    }
}

// =======================
// 5. OVERLAY INJECTION
// =======================

// Prevent multiple injections
if (window.__SPEEDY_CONTENT_SCRIPT_LOADED__) {
    console.log('⚠️ Content script already loaded, skipping re-initialization');
} else {
    window.__SPEEDY_CONTENT_SCRIPT_LOADED__ = true;

let overlayInjected = false;

function injectOverlay() {
    if (overlayInjected) return;
    
    // Create container for overlay
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'speedy-ai-overlay-root';
    document.body.appendChild(overlayContainer);
    
    // Inject the overlay script
    const script = document.createElement('script');
    script.src = browser.runtime.getURL('overlay/overlay.js');
    document.body.appendChild(script);
    
    overlayInjected = true;
    console.log('✅ Overlay injected');
}

// Handle state changes from background
function handleStateChange(data) {
    // Notify overlay of state changes
    window.postMessage({
        type: 'SPEEDY_STATE_CHANGED',
        data
    }, '*');
}

// Listen for messages from overlay (page context) and relay to background
window.addEventListener('message', (event) => {
    // Only accept messages from same window
    if (event.source !== window) return;
    
    // Handle overlay submit
    if (event.data.type === 'SPEEDY_OVERLAY_SUBMIT') {
        const message = event.data.message;
        const selectedTabs = event.data.selectedTabs || [];
        const model = event.data.model || 'anthropic/claude-3.5-sonnet';
        
        // Use IIFE to handle async without blocking
        (async () => {
            // Store message, selected tabs, and model in chrome storage
            if (browser && browser.storage) {
                await browser.storage.local.set({ 
                    sharedState: { 
                        currentMessage: message,
                        pendingMessage: message,
                        selectedTabs: selectedTabs,
                        selectedModel: model
                    }
                });
            }
            
            // Request to open sidepanel with message, context, and model
            if (browser && browser.runtime) {
                try {
                    // Try to open sidepanel
                    const response = await browser.runtime.sendMessage({
                        type: 'OPEN_SIDEPANEL_WITH_MESSAGE',
                        message: message,
                        selectedTabs: selectedTabs,
                        model: model
                    });
                    
                    if (response && !response.success) {
                        // If failed, show a notification to use Cmd+B
                        console.log('Tip: Click the extension icon or press Cmd+B to open the sidepanel');
                    }
                } catch (err) {
                    console.error("❌ [SPEEDY] Failed to send message to background:", err);
                    console.log('Please click the extension icon to open the sidepanel');
                }
            }
        })();
    }
    
    // Handle message changes from overlay
    if (event.data.type === 'SPEEDY_OVERLAY_MESSAGE_CHANGE') {
        const message = event.data.message;
        
        // Sync with storage
        if (browser && browser.storage) {
            browser.storage.local.get(['sharedState'], (result) => {
                const sharedState = result.sharedState || {};
                sharedState.currentMessage = message;
                browser.storage.local.set({ sharedState });
            });
        }
    }
    
    // Handle context changes from overlay
    if (event.data.type === 'SPEEDY_CONTEXT_CHANGED') {
        const selectedTabs = event.data.selectedTabs || [];
        
        // Sync with storage
        if (browser && browser.storage) {
            browser.storage.local.get(['sharedState'], (result) => {
                const sharedState = result.sharedState || {};
                sharedState.selectedTabs = selectedTabs;
                browser.storage.local.set({ sharedState });
            });
        }
    }
    
    // Handle tab requests from overlay
    if (event.data.type === 'SPEEDY_REQUEST_TABS') {
        // Use IIFE to handle async without blocking
        if (browser && browser.runtime) {
            (async () => {
                try {
                    const response = await browser.runtime.sendMessage({
                        type: 'GET_ALL_TABS'
                    });
                    
                    if (response && response.success) {
                        // Send tabs back to overlay
                        window.postMessage({
                            type: 'SPEEDY_TABS_RESPONSE',
                            tabs: response.tabs
                        }, '*');
                    }
                } catch (err) {
                    console.log('Failed to get tabs:', err.message);
                }
            })();
        }
    }
    
    // Handle API requests from overlay
    if (event.data.type === 'SPEEDY_API_REQUEST') {
        const { requestId, method, endpoint, body } = event.data;
        
        // Log chat requests with AI message details
        if (endpoint.includes('/chat') && body) {
            console.log("💬 [SPEEDY] Sending message to AI");
            console.log("🤖 Model:", body.model);
            
            if (body.messages && Array.isArray(body.messages)) {
                body.messages.forEach((msg, index) => {
                    if (msg.role === 'user' && msg.content) {
                        console.log(`\n📨 User message (${msg.content.length} chars):`);
                        console.log(msg.content);
                        console.log("\n");
                    }
                });
            }
        }
        
        // Use IIFE to handle async without blocking the event listener
        if (browser && browser.runtime) {
            (async () => {
                try {
                    const response = await browser.runtime.sendMessage({
                        type: 'API_REQUEST',
                        method,
                        endpoint,
                        body
                    });
                    
                    if (response.error) {
                        console.log("❌ [SPEEDY] Error:", response.error);
                    }
                    
                    // Send response back to overlay
                    window.postMessage({
                        type: 'SPEEDY_API_RESPONSE',
                        requestId,
                        success: response.success,
                        data: response.data,
                        error: response.error
                    }, '*');
                } catch (err) {
                    console.error("❌ [SPEEDY] API request failed:", err);
                    // Send error back to overlay
                    window.postMessage({
                        type: 'SPEEDY_API_RESPONSE',
                        requestId,
                        success: false,
                        error: err.message || 'API request failed'
                    }, '*');
                }
            })();
        }
    }
    
    // Handle screenshot capture requests from overlay
    if (event.data.type === 'SPEEDY_CAPTURE_SCREENSHOT') {
        const { requestId } = event.data;
        
        // Use IIFE to handle async without blocking
        if (browser && browser.runtime) {
            (async () => {
                try {
                    const response = await browser.runtime.sendMessage({
                        type: 'CAPTURE_SCREENSHOT'
                    });
                    
                    // Send response back to overlay
                    window.postMessage({
                        type: 'SPEEDY_SCREENSHOT_RESPONSE',
                        requestId,
                        success: response.success,
                        dataUrl: response.dataUrl,
                        error: response.error
                    }, '*');
                } catch (err) {
                    // Send error back to overlay
                    window.postMessage({
                        type: 'SPEEDY_SCREENSHOT_RESPONSE',
                        requestId,
                        success: false,
                        error: err.message || 'Screenshot capture failed'
                    }, '*');
                }
            })();
        }
    }
    
    // Handle tab content extraction requests from overlay
    if (event.data.type === 'SPEEDY_EXTRACT_TAB_CONTENT') {
        const { requestId, tabId } = event.data;
        
        // Use IIFE to handle async without blocking
        if (browser && browser.runtime) {
            (async () => {
                try {
                    const response = await browser.runtime.sendMessage({
                        type: 'EXTRACT_TAB_CONTENT',
                        tabId: tabId
                    });
                    
                    // Send response back to overlay
                    window.postMessage({
                        type: 'SPEEDY_EXTRACT_RESPONSE',
                        requestId,
                        success: response.success,
                        content: response.content,
                        error: response.error
                    }, '*');
                } catch (err) {
                    console.error("❌ [SPEEDY] Tab content extraction failed:", err);
                    // Send error back to overlay
                    window.postMessage({
                        type: 'SPEEDY_EXTRACT_RESPONSE',
                        requestId,
                        success: false,
                        error: err.message || 'Content extraction failed'
                    }, '*');
                }
            })();
        }
    }
    
    // Handle overlay state requests
    if (event.data.type === 'SPEEDY_GET_OVERLAY_STATE') {
        console.log('📥 [Content] Received SPEEDY_GET_OVERLAY_STATE request');
        // Get overlay state from storage and send back
        if (browser && browser.storage) {
            browser.storage.local.get(['overlayState'], (result) => {
                console.log('📤 [Content] Retrieved overlay state from storage:', result.overlayState);
                const state = result.overlayState || { isVisible: false };
                console.log('📤 [Content] Sending state response:', state);
                window.postMessage({
                    type: 'SPEEDY_OVERLAY_STATE_RESPONSE',
                    state: state
                }, '*');
            });
        } else {
            console.error('❌ [Content] browser.storage not available');
        }
    }
    
    // Handle overlay state save requests
    if (event.data.type === 'SPEEDY_SAVE_OVERLAY_STATE') {
        const isVisible = event.data.isVisible;
        console.log('💾 [Content] Received SPEEDY_SAVE_OVERLAY_STATE request:', isVisible);
        
        // Save to storage
        if (browser && browser.storage) {
            const stateToSave = {
                overlayState: {
                    isVisible: isVisible,
                    timestamp: Date.now()
                }
            };
            console.log('💾 [Content] Saving to storage:', stateToSave);
            browser.storage.local.set(stateToSave, () => {
                console.log('✅ [Content] State saved successfully');
            });
        } else {
            console.error('❌ [Content] browser.storage not available');
        }
    }
});

// Listen for storage changes and broadcast to all tabs
if (browser && browser.storage) {
    console.log('👂 [Content] Setting up storage change listener');
    browser.storage.onChanged.addListener((changes, namespace) => {
        console.log('🔔 [Content] Storage changed:', namespace, changes);
        if (namespace === 'local' && changes.overlayState) {
            console.log('🔔 [Content] overlayState changed:', changes.overlayState);
            console.log('🔔 [Content] New value:', changes.overlayState.newValue);
            console.log('🔔 [Content] Old value:', changes.overlayState.oldValue);
            // Broadcast state change to overlay
            window.postMessage({
                type: 'SPEEDY_OVERLAY_STATE_CHANGED',
                state: changes.overlayState.newValue
            }, '*');
            console.log('📢 [Content] Broadcasted state change to overlay');
        }
    });
} else {
    console.error('❌ [Content] browser.storage not available for listener');
}

// =======================
// INITIALIZATION
// =======================

// Check if already initialized to prevent multiple injections
if (typeof window.__speedyAiInitialized === 'undefined') {
    window.__speedyAiInitialized = true;

    // Initialize the content script
    function initialize() {
        console.log("🚀 [Content] ===== SPEEDY AI CONTENT SCRIPT LOADED =====");
        console.log("🚀 [Content] URL:", window.location.href);
        console.log("🚀 [Content] Timestamp:", new Date().toISOString());
        
        // Set up message handlers
        setupMessageHandlers();
        
        // Inject overlay
        injectOverlay();
        
        console.log("✅ [Content] Initialization complete");
    }

    // Auto-initialize if running as a content script
    if (typeof document !== 'undefined' && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else if (typeof document !== 'undefined') {
        initialize();
    }
} else {
    console.log("⏭️ Speedy AI Content Script already initialized, skipping");
}

// Functions are available globally in the content script context
// No exports needed for Chrome extension content scripts

} // End of guard clause
