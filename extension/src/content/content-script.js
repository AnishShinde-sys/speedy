// Extracted Content Functions from main.js
// These are the key functions for content extraction from websites

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
// 2. PDF DETECTION & EXTRACTION
// =======================

// Get PDF URL from the page
function getPdfUrl() {
    const contentType = document.contentType;
    if (typeof contentType === "string" && contentType.toLowerCase().includes("application/pdf")) {
        return window.location.href;
    }
    
    const embedPdf = document.querySelector('embed[type="application/pdf"]');
    if (embedPdf?.src) {
        console.info("PDF URL extracted from <embed> src:", embedPdf.src);
        return embedPdf.src;
    }
    
    const objectPdf = document.querySelector('object[type="application/pdf"]');
    if (objectPdf?.data) {
        console.info("PDF URL extracted from <object> data:", objectPdf.data);
        return objectPdf.data;
    }
    
    return window.location.href;
}

// Check if current page is a PDF
function isPdfPage() {
    const contentType = document.contentType;
    return !!(
        (typeof contentType === "string" && contentType.toLowerCase().includes("application/pdf")) ||
        window.PDFViewerApplication ||
        document.querySelector('embed[type="application/pdf"], object[type="application/pdf"]')
    );
}

// Extract PDF content (requires pdf.js library)
async function extractPdfContent(url) {
    try {
        let pdfContent;
        
        if (window.PDFViewerApplication?.pdfDocument) {
            console.info("📄 Using existing PDF.js viewer");
            // Extract from existing PDF viewer
            pdfContent = await extractFromPdfViewer();
        } else {
            console.info("🔧 Parsing PDF directly from URL via pdf.js");
            // Parse PDF from URL
            pdfContent = await parsePdfFromUrl(url);
        }
        
        return `<pdf_document is_pdf="true">
    ${pdfContent}
</pdf_document>`;
    } catch (error) {
        console.error("Error extracting PDF content:", error);
        return "";
    }
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
// 4. MAIN CONTENT EXTRACTION
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

// Main function to extract page content
async function extractPageContent() {
    const url = window.location.href;
    const title = document.title;
    const isPdf = isPdfPage();
    
    let content;
    
    if (isPdf) {
        const pdfUrl = getPdfUrl();
        content = await extractPdfContent(pdfUrl);
    } else {
        try {
            // Mark viewport elements for extraction
            markViewportElements();
        } catch (error) {
            console.error("[content] Error marking viewport elements:", error);
        }
        
        // Extract HTML content
        const rawHtml = document.documentElement.innerHTML;
        const metadata = extractMetadata(url);
        
        content = processHtmlContent({
            url: url,
            title: title,
            rawHtml: rawHtml,
            metadata: metadata
        });
        
        try {
            // Clean up viewport markers
            cleanupViewportMarkers();
        } catch (error) {
            console.error("[content] Error cleaning up viewport markers:", error);
        }
    }
    
    const result = {
        url: url,
        title: title,
        content: content,
        metadata: {
            ...(!isPdf ? extractMetadata(url) : {}),
            isPdf: isPdf
        }
    };
    
    console.info("✅ Content processing complete:", {
        url: url,
        title: title.substring(0, 50) + (title.length > 50 ? "..." : ""),
        contentLength: content.length,
        isPdf: isPdf
    });
    
    return result;
}

// Process HTML content and extract structured text
function processHtmlContent(options) {
    const { rawHtml } = options;
    
    // Create a temporary container to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;
    
    // Remove script and style elements
    tempDiv.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    
    // Extract structured content
    const title = document.title;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
        .map(h => h.textContent?.trim())
        .filter(Boolean);
    const paragraphs = Array.from(document.querySelectorAll('p'))
        .map(p => p.textContent?.trim())
        .filter(Boolean);
    const listItems = Array.from(document.querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean);
    
    // Combine content with structure
    let content = `Title: ${title}\n`;
    if (metaDescription) content += `Description: ${metaDescription}\n`;
    if (headings.length > 0) content += `\nHeadings:\n${headings.slice(0, 10).join('\n')}\n`;
    if (paragraphs.length > 0) content += `\nContent:\n${paragraphs.slice(0, 20).join('\n\n')}\n`;
    if (listItems.length > 0) content += `\nList Items:\n${listItems.slice(0, 15).join('\n')}\n`;
    
    // Limit content size to 8000 characters
    return content.substring(0, 8000);
}

// =======================
// 5. MESSAGE HANDLERS
// =======================

// Handle messages from extension
function setupMessageHandlers() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            handleMessage(message, sendResponse);
            return true; // Keep message channel open for async response
        });
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
                console.error("[content] get_page_content failed", error);
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
            // Notify overlay to toggle visibility
            window.postMessage({
                type: 'SPEEDY_TOGGLE_OVERLAY'
            }, '*');
            sendResponse({ success: true });
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
// OVERLAY INJECTION
// =======================

let overlayInjected = false;

function injectOverlay() {
    if (overlayInjected) return;
    
    // Create container for overlay
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'speedy-ai-overlay-root';
    document.body.appendChild(overlayContainer);
    
    // Inject the overlay script
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('overlay/overlay.js');
    // Remove type="module" since it's now a regular script
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
window.addEventListener('message', async (event) => {
    // Only accept messages from same window
    if (event.source !== window) return;
    
    // Handle overlay submit
    if (event.data.type === 'SPEEDY_OVERLAY_SUBMIT') {
        const message = event.data.message;
        const selectedTabs = event.data.selectedTabs || [];
        const model = event.data.model || 'anthropic/claude-3.5-sonnet';
        
        // Store message, selected tabs, and model in chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set({ 
                sharedState: { 
                    currentMessage: message,
                    pendingMessage: message,
                    selectedTabs: selectedTabs,
                    selectedModel: model
                }
            });
        }
        
        // Request to open sidepanel with message, context, and model
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            try {
                // Try to open sidepanel
                const response = await chrome.runtime.sendMessage({
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
                console.log('Please click the extension icon to open the sidepanel');
            }
        }
    }
    
    // Handle message changes from overlay
    if (event.data.type === 'SPEEDY_OVERLAY_MESSAGE_CHANGE') {
        const message = event.data.message;
        
        // Sync with storage
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['sharedState'], (result) => {
                const sharedState = result.sharedState || {};
                sharedState.currentMessage = message;
                chrome.storage.local.set({ sharedState });
            });
        }
    }
    
    // Handle context changes from overlay
    if (event.data.type === 'SPEEDY_CONTEXT_CHANGED') {
        const selectedTabs = event.data.selectedTabs || [];
        
        // Sync with storage
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['sharedState'], (result) => {
                const sharedState = result.sharedState || {};
                sharedState.selectedTabs = selectedTabs;
                chrome.storage.local.set({ sharedState });
            });
        }
    }
    
    // Handle tab requests from overlay
    if (event.data.type === 'SPEEDY_REQUEST_TABS') {
        // Request tabs from background script
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            try {
                const response = await chrome.runtime.sendMessage({
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
        }
    }
});

// =======================
// INITIALIZATION
// =======================

// Initialize the content script
function initialize() {
    console.log("🚀 Speedy AI Content Script loaded");
    
    // Set up message handlers
    setupMessageHandlers();
    
    // Inject overlay
    injectOverlay();
}

// Auto-initialize if running as a content script
if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else if (typeof document !== 'undefined') {
    initialize();
}

// Functions are available globally in the content script context
// No exports needed for Chrome extension content scripts
