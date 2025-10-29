// Speedy AI Overlay - Cursor-Style Composer
(function() {
  'use strict';

  // Import analytics functions (will be bundled by Vite)
  // Note: These will be available through the global scope after bundling
  const analytics = {
    trackEvent: (name, props) => {
      try {
        if (window.posthog) {
          window.posthog.capture(name, props);
        }
      } catch (e) {
        console.log('Analytics not available:', e);
      }
    }
  };

  // Helper function to make API requests through content script -> background script
  // This avoids CSP issues on strict pages like openrouter.ai
  // The overlay runs in page context, so we use window.postMessage to talk to content script
  async function apiRequest(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
      const requestId = `api_${Date.now()}_${Math.random()}`;
      
      // Listen for response
      const messageHandler = (event) => {
        if (event.source !== window) return;
        if (event.data.type === 'SPEEDY_API_RESPONSE' && event.data.requestId === requestId) {
          window.removeEventListener('message', messageHandler);
          
          if (event.data.success) {
            resolve(event.data.data);
          } else {
            reject(new Error(event.data.error || 'API request failed'));
          }
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Send request to content script
      window.postMessage({
        type: 'SPEEDY_API_REQUEST',
        requestId,
        method,
        endpoint,
        body
      }, '*');
      
      // Timeout after 30 seconds
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        reject(new Error('API request timeout'));
      }, 30000);
    });
  }

  // Create the overlay HTML
  function createOverlay() {
    const overlayHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        #speedy-tab-menu::-webkit-scrollbar,
        #speedy-model-menu::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        #speedy-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
          opacity: 0.5;
        }
        
        /* Message styles */
        #speedy-messages-list::-webkit-scrollbar {
          display: none;
        }
        
        .speedy-message-wrapper {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
          opacity: 0;
          transform: scale(0.8);
          animation: messageIn 0.2s ease-out forwards;
        }
        
        @keyframes messageIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .speedy-message-wrapper.user {
          justify-content: flex-end;
        }
        
        .speedy-message-wrapper.assistant {
          justify-content: flex-start;
        }
        
        .speedy-message-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 72%;
        }
        
        .speedy-message-wrapper.user .speedy-message-content {
          align-items: flex-end;
        }
        
        .speedy-message-wrapper.assistant .speedy-message-content {
          align-items: flex-start;
        }
        
        .speedy-message {
          position: relative;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 17px;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          white-space: pre-wrap;
          word-break: break-word;
          width: fit-content;
        }
        
        .speedy-message-user {
          background: rgba(96, 165, 250, 0.6);
          color: rgba(255, 255, 255, 0.9);
          margin-left: auto;
        }
        
        .speedy-message-assistant {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .speedy-message-timestamp {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.4);
          padding: 0 6px;
        }
        
        .speedy-message-streaming::after {
          content: '';
          display: inline-block;
          width: 6px;
          height: 16px;
          background: rgba(255, 255, 255, 0.6);
          margin-left: 2px;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        
        /* Pop-up animation */
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(30px) scale(0.9);
          }
          50% {
            transform: translateX(-50%) translateY(-5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        
        @keyframes popOut {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.95);
          }
        }
        
        #speedy-floating-overlay.visible {
          animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        #speedy-floating-overlay.hidden {
          animation: popOut 0.25s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        
        /* Chat History Sidebar Styles */
        #speedy-chat-sidebar {
          position: fixed;
          top: 0;
          right: -350px;
          width: 350px;
          height: 100vh;
          background: #1a1a1a;
          border-left: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
          transition: right 0.3s ease-out;
          z-index: 999998;
          display: flex;
          flex-direction: column;
        }
        
        #speedy-chat-sidebar.open {
          right: 0;
        }
        
        .speedy-sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .speedy-sidebar-title {
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .speedy-sidebar-close {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        
        .speedy-sidebar-close:hover {
          color: rgba(255, 255, 255, 1);
        }
        
        .speedy-sidebar-actions {
          display: flex;
          gap: 8px;
        }
        
        .speedy-new-chat-btn {
          flex: 1;
          padding: 8px 12px;
          background: rgba(96, 165, 250, 0.6);
          border: none;
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.9);
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .speedy-new-chat-btn:hover {
          background: rgba(96, 165, 250, 0.8);
        }
        
        .speedy-search-box {
          width: 100%;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.9);
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .speedy-search-box:focus {
          border-color: rgba(96, 165, 250, 0.6);
        }
        
        .speedy-search-box::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .speedy-chat-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }
        
        .speedy-chat-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .speedy-chat-list::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .speedy-chat-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        
        .speedy-chat-item {
          padding: 12px;
          margin-bottom: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        
        .speedy-chat-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .speedy-chat-item.active {
          background: rgba(96, 165, 250, 0.3);
          border-color: rgba(96, 165, 250, 0.5);
        }
        
        .speedy-chat-item-title {
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .speedy-chat-item-preview {
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 6px;
        }
        
        .speedy-chat-item-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }
        
        .speedy-chat-item-actions {
          position: absolute;
          top: 8px;
          right: 8px;
          display: none;
          gap: 4px;
        }
        
        .speedy-chat-item:hover .speedy-chat-item-actions {
          display: flex;
        }
        
        .speedy-chat-action-btn {
          padding: 4px;
          background: rgba(0, 0, 0, 0.3);
          border: none;
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .speedy-chat-action-btn:hover {
          background: rgba(0, 0, 0, 0.5);
          color: rgba(255, 255, 255, 1);
        }
        
        .speedy-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .speedy-empty-state-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.3;
        }
        
        .speedy-loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .speedy-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        
        .speedy-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000000;
        }
        
        .speedy-modal {
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 12px;
          padding: 24px;
          min-width: 400px;
          max-width: 90vw;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .speedy-modal-title {
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 16px;
        }
        
        .speedy-modal-input {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.9);
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          outline: none;
          margin-bottom: 16px;
        }
        
        .speedy-modal-input:focus {
          border-color: rgba(96, 165, 250, 0.6);
        }
        
        .speedy-modal-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        
        .speedy-modal-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .speedy-modal-btn-primary {
          background: rgba(96, 165, 250, 0.6);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .speedy-modal-btn-primary:hover {
          background: rgba(96, 165, 250, 0.8);
        }
        
        .speedy-modal-btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .speedy-modal-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        
        .speedy-modal-btn-danger {
          background: rgba(239, 68, 68, 0.6);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .speedy-modal-btn-danger:hover {
          background: rgba(239, 68, 68, 0.8);
        }
      </style>
      
      
      <!-- Chat History Sidebar -->
      <div id="speedy-chat-sidebar">
        <div class="speedy-sidebar-header">
          <div class="speedy-sidebar-title">
            Chat History
            <button class="speedy-sidebar-close" id="speedy-sidebar-close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="speedy-sidebar-actions">
            <button class="speedy-new-chat-btn" id="speedy-new-chat-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>
          </div>
          <input type="text" class="speedy-search-box" id="speedy-chat-search" placeholder="Search chats...">
        </div>
        <div class="speedy-chat-list" id="speedy-chat-list">
          <div class="speedy-loading-spinner">
            <div class="speedy-spinner"></div>
          </div>
        </div>
      </div>
      
      <div id="speedy-floating-overlay" style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        z-index: 999999;
        width: 500px;
        max-width: 90vw;
        max-height: 350px;
        display: flex;
        flex-direction: column;
        opacity: 0;
        pointer-events: none;
      ">
        <!-- Main Container -->
        <form id="speedy-form" action="javascript:void(0)" onsubmit="return false;" style="
          background: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(9px) saturate(1.05);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: 8px;
          display: flex;
          flex-direction: column;
          max-height: 350px;
          transition: box-shadow 100ms ease-in-out, border-color 100ms ease-in-out, backdrop-filter 200ms ease-in-out;
          position: relative;
        ">
          
          <!-- Chat Messages List -->
          <div id="speedy-messages-list" style="
            display: none;
            flex-direction: column;
            overflow-y: auto;
            margin: 0px 0px 8px 0px;
            padding: 8px;
            max-height: 220px;
            width: 100%;
            gap: 6px;
            position: relative;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
          "></div>
          
          <!-- Context Pills Row -->
          <div style="
            align-items: center;
            display: flex;
            gap: 4px;
            width: 100%;
            flex-wrap: wrap;
            margin: 0px 0px 8px 0px;
          ">
            <!-- @ Button (Fixed Position) -->
            <div tabindex="0" id="speedy-at-button" style="
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
              padding: 0 4px;
              height: 18px;
              min-height: 18px;
              max-height: 18px;
              width: auto;
              box-sizing: border-box;
              border-radius: 4px;
              border: 1px solid rgba(228, 228, 228, 0.11);
              outline: none;
              flex-shrink: 0;
              background: transparent;
              transition-property: all;
              transition-duration: 0s;
              transition-timing-function: ease;
              user-select: none;
              font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              font-size: 10px;
              color: rgba(228, 228, 228, 0.55);
            ">
              <span style="font-size: 10px; color: rgba(228, 228, 228, 0.55); line-height: 18px;">@</span>
            </div>
            
            <!-- Context Pills Container -->
            <div id="speedy-context-pills" style="
              display: contents;
            "></div>
          </div>
          
          <!-- Tab Selection Menu -->
            <div id="speedy-tab-menu" style="
              display: none;
              position: absolute;
              bottom: calc(100% + 8px);
              left: 0;
              right: 0;
              z-index: 1001;
              flex-shrink: 0;
            ">
            <div style="
              background: rgba(26, 26, 26, 0.98);
              backdrop-filter: blur(12px);
              border: 1px solid rgba(255, 255, 255, 0.12);
              border-radius: 12px;
              padding: 8px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
              max-height: 320px;
              overflow-y: auto;
            " class="no-scrollbar">
              <div id="speedy-tab-list" style="
                display: flex;
                flex-direction: column;
                gap: 1px;
              "></div>
            </div>
          </div>
          
          <!-- Input Area -->
          <div style="
            position: relative;
            padding-top: 0px;
            cursor: text;
            gap: 0px;
            margin: 0px;
          ">
            <div style="
              height: auto;
              min-height: 22px;
              width: 100%;
              max-height: 120px;
            ">
              <div contenteditable="true" 
                   id="speedy-input"
                   spellcheck="false"
                   tabindex="0"
                   role="textbox"
                   aria-label="Chat input"
                   data-placeholder="Plan, search, build anything"
                   style="
                     resize: none;
                     overflow: hidden;
                     line-height: 1.4;
                     font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                     font-size: 13px;
                     color: rgba(255, 255, 255, 0.95);
                     background-color: transparent;
                     display: block;
                     outline: none;
                     box-sizing: border-box;
                     border: none;
                     overflow-wrap: break-word;
                     word-break: break-word;
                     padding: 0;
                     user-select: text;
                     white-space: pre-wrap;
                     min-height: 20px;
                     max-height: 90px;
                     overflow-y: auto;
                   "
              ></div>
              </div>
            </div>
            
          <!-- Bottom Bar: Model + Actions -->
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
              flex-shrink: 0;
              cursor: auto;
              width: 100%;
              margin: 8px 0px 0px 0px;
              height: 22px;
              max-width: 100%;
              overflow: visible;
          ">
            <!-- Left: Model Picker + Upload/Screenshot Buttons -->
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              flex-shrink: 1;
              flex-grow: 0;
              min-width: 0px;
              height: 20px;
              overflow: visible;
            ">
              <div style="min-width: 0px; max-width: 200px; position: relative; flex-shrink: 1; overflow: visible;">
                <div id="speedy-model-selector" style="
                  display: flex;
                  gap: 4px;
                  font-size: 12px;
                  align-items: center;
                  line-height: 12px;
                  cursor: pointer;
                  min-width: 0px;
                  max-width: 100%;
                  padding: 2.5px 6px;
                  border-radius: 23px;
                  border: none;
                  background: transparent;
                  flex-shrink: 1;
                  overflow: hidden;
                  transition: background 0.1s;
                ">
                  <div style="
                    display: flex;
                    align-items: center;
                    color: rgba(255, 255, 255, 0.9);
                    gap: 4px;
                    min-width: 0px;
                    max-width: 100%;
                    overflow: hidden;
                    flex-shrink: 1;
                    flex-grow: 1;
                  ">
                    <div style="
                      min-width: 0px;
                      text-overflow: ellipsis;
                      vertical-align: middle;
                  white-space: nowrap;
                      line-height: 12px;
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      overflow: hidden;
                      height: 16px;
                      flex-shrink: 1;
                      flex-grow: 1;
                    ">
                      <div style="
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 100%;
                        min-width: 0px;
                        display: flex;
                        align-items: baseline;
                        gap: 2px;
                      ">
                        <span id="speedy-model-name" style="
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          line-height: normal;
                          max-width: 100%;
                          flex: 1 1 auto;
                          min-width: 0px;
                          padding-bottom: 1px;
                        ">sonnet</span>
                      </div>
                    </div>
                  </div>
                  <svg id="speedy-model-chevron" style="
                    width: 10px;
                    height: 10px;
                    flex-shrink: 0;
                    color: rgba(255, 255, 255, 0.9);
                    transition: transform 0.2s;
                  " fill="currentColor" viewBox="0 0 20 20">
                    <path d="M14.128 7.16482C14.3126 6.95983 14.6298 6.94336 14.835 7.12771C15.0402 7.31242 15.0567 7.62952 14.8721 7.83477L10.372 12.835L10.2939 12.9053C10.2093 12.9667 10.1063 13 9.99995 13C9.85833 12.9999 9.72264 12.9402 9.62788 12.835L5.12778 7.83477L5.0682 7.75273C4.95072 7.55225 4.98544 7.28926 5.16489 7.12771C5.34445 6.96617 5.60969 6.95939 5.79674 7.09744L5.87193 7.16482L9.99995 11.7519L14.128 7.16482Z"/>
                  </svg>
                </div>
                
                <!-- Model Dropdown Menu -->
                <div id="speedy-model-menu" style="
                  display: none;
                  position: fixed;
                  bottom: 80px;
                  left: 20px;
                  background: rgba(255, 255, 255, 1);
                  border-radius: 12px;
                  box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 24px, rgba(0, 0, 0, 0.05) 0px 2px 8px;
                  max-height: 350px;
                  overflow-y: auto;
                  padding: 8px;
                  z-index: 10000;
                  min-width: 280px;
                  pointer-events: auto;
                ">
                  <div id="all-models"></div>
                </div>
              </div>
              
              <!-- Image Upload Button (Paperclip) -->
              <button type="button" id="speedy-image-upload" style="
                width: 16px;
                height: 16px;
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.9);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                flex-shrink: 0;
                transform: scale(1);
              " title="Attach file">
                <svg id="speedy-paperclip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              
              <!-- Screenshot Capture Button (Crop) -->
              <button type="button" id="speedy-screenshot-capture" style="
                width: 16px;
                height: 16px;
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.9);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                flex-shrink: 0;
                transform: scale(1);
              " title="Capture screen">
                <svg id="speedy-crop-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                  <path d="M6.13 1 6 16a2 2 0 0 0 2 2h15"/>
                  <path d="M1 6.13 16 6a2 2 0 0 1 2 2v15"/>
                </svg>
              </button>
              

              </div>
              
            <!-- Right: Chat History + Submit Button -->
            <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end; flex-shrink: 0;">
              <!-- Chat History Button -->
              <button type="button" id="speedy-sidebar-toggle-top" style="
                width: 18px;
                height: 18px;
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                transition: color 0.15s, opacity 0.15s;
                flex-shrink: 0;
              " title="Chat history">
                <svg width="14" height="14" stroke-linejoin="round" viewBox="0 0 16 16" style="color: currentcolor;">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.96452 2.5C11.0257 2.5 13.5 4.96643 13.5 8C13.5 11.0336 11.0257 13.5 7.96452 13.5C6.12055 13.5 4.48831 12.6051 3.48161 11.2273L3.03915 10.6217L1.828 11.5066L2.27046 12.1122C3.54872 13.8617 5.62368 15 7.96452 15C11.8461 15 15 11.87 15 8C15 4.13001 11.8461 1 7.96452 1C5.06835 1 2.57851 2.74164 1.5 5.23347V3.75V3H0V3.75V7.25C0 7.66421 0.335786 8 0.75 8H3.75H4.5V6.5H3.75H2.63724C3.29365 4.19393 5.42843 2.5 7.96452 2.5ZM8.75 5.25V4.5H7.25V5.25V7.8662C7.25 8.20056 7.4171 8.51279 7.6953 8.69825L9.08397 9.62404L9.70801 10.0401L10.5401 8.79199L9.91603 8.37596L8.75 7.59861V5.25Z" fill="currentColor"/>
                </svg>
              </button>
              
              <!-- Submit Button -->
              <button
                id="speedy-submit"
                type="submit"
                disabled
                style="
                  width: 18px;
                  height: 18px;
                  background: transparent;
                  border: none;
                  color: rgba(255, 255, 255, 0.5);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 0;
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                  flex-shrink: 0;
                  transform: scale(1);
                "
              >
                <svg id="speedy-send-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            </div>
            
          <!-- Resize Handles -->
          <div class="resize-handle resize-n" style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100%; height: 5px; cursor: n-resize;"></div>
          <div class="resize-handle resize-s" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; height: 5px; cursor: s-resize;"></div>
          <div class="resize-handle resize-e" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 5px; height: 100%; cursor: e-resize;"></div>
          <div class="resize-handle resize-w" style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 5px; height: 100%; cursor: w-resize;"></div>
          <div class="resize-handle resize-ne" style="position: absolute; top: 0; right: 0; width: 12px; height: 12px; cursor: ne-resize;"></div>
          <div class="resize-handle resize-nw" style="position: absolute; top: 0; left: 0; width: 12px; height: 12px; cursor: nw-resize;"></div>
          <div class="resize-handle resize-se" style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; cursor: se-resize;"></div>
          <div class="resize-handle resize-sw" style="position: absolute; bottom: 0; left: 0; width: 12px; height: 12px; cursor: sw-resize;"></div>
        </form>
      </div>
      
      <!-- Floating Action Button (FAB) - Minimized State -->
      <div id="speedy-fab" style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) scale(0);
        z-index: 999999;
        width: 32px;
        height: 32px;
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(9px) saturate(1.05);
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      "></div>
    `;

    return overlayHTML;
  }

  // Initialize the overlay
  function initOverlay() {
    const container = document.getElementById('speedy-ai-overlay-root');
    if (!container) {
      console.error('Speedy AI: Overlay container not found');
      return;
    }

    // Check if shadow DOM already exists (prevent re-attachment error)
    // Check if shadow root already exists
    let shadowRoot = container.shadowRoot;
    if (shadowRoot) {
      console.log('♻️ [Overlay] Shadow DOM already exists, reusing it');
      // Clear existing content to re-initialize
      shadowRoot.innerHTML = '';
    } else {
      try {
        // Create shadow DOM for style isolation
        shadowRoot = container.attachShadow({ mode: 'open' });
      } catch (error) {
        console.error('❌ [Overlay] Failed to attach shadow DOM:', error);
        // If attachment fails, element might already have shadow DOM in closed mode
        // Try to remove and recreate the container
        container.remove();
        return;
      }
    }
    
    // Add the overlay HTML
    shadowRoot.innerHTML = createOverlay();
    
    // Get elements
    const overlay = shadowRoot.getElementById('speedy-floating-overlay');
    const fab = shadowRoot.getElementById('speedy-fab');
    const input = shadowRoot.getElementById('speedy-input');
    const button = shadowRoot.getElementById('speedy-submit');
    const sendIcon = shadowRoot.getElementById('speedy-send-icon');
    const form = shadowRoot.getElementById('speedy-form');
    const atButton = shadowRoot.getElementById('speedy-at-button');
    const paperclipIcon = shadowRoot.getElementById('speedy-paperclip-icon');
    const cropIcon = shadowRoot.getElementById('speedy-crop-icon');
    const tabMenu = shadowRoot.getElementById('speedy-tab-menu');
    const tabList = shadowRoot.getElementById('speedy-tab-list');
    const contextPills = shadowRoot.getElementById('speedy-context-pills');
    const modelSelector = shadowRoot.getElementById('speedy-model-selector');
    const modelMenu = shadowRoot.getElementById('speedy-model-menu');
    const modelName = shadowRoot.getElementById('speedy-model-name');
    const modelChevron = shadowRoot.getElementById('speedy-model-chevron');
    const allModelsContainer = shadowRoot.getElementById('all-models');
    const messagesList = shadowRoot.getElementById('speedy-messages-list');
    const imageUploadBtn = shadowRoot.getElementById('speedy-image-upload');
    const screenshotBtn = shadowRoot.getElementById('speedy-screenshot-capture');
    
    // Chat sidebar elements
    const sidebarToggle = shadowRoot.getElementById('speedy-sidebar-toggle-top');
    const chatSidebar = shadowRoot.getElementById('speedy-chat-sidebar');
    const sidebarClose = shadowRoot.getElementById('speedy-sidebar-close');
    const newChatBtn = shadowRoot.getElementById('speedy-new-chat-btn');
    const chatSearch = shadowRoot.getElementById('speedy-chat-search');
    const chatList = shadowRoot.getElementById('speedy-chat-list');
    
    // State
    let message = '';
    let isVisible = false;
    let isMinimized = true; // Start in minimized state (FAB visible)
    let selectedTabs = [];
    
    // Load initial overlay state from storage (via content script)
    function loadOverlayState() {
      console.log('🔍 [Overlay] Requesting overlay state from content script');
      console.log('🔍 [Overlay] Current isVisible:', isVisible);
      // Request overlay state from content script
      window.postMessage({
        type: 'SPEEDY_GET_OVERLAY_STATE'
      }, '*');
    }
    
    // Save overlay state to storage (via content script)
    function saveOverlayState(visible) {
      console.log('💾 [Overlay] Saving overlay state:', visible);
      console.log('💾 [Overlay] Current isVisible:', isVisible);
      // Send overlay state to content script to save
      window.postMessage({
        type: 'SPEEDY_SAVE_OVERLAY_STATE',
        isVisible: visible
      }, '*');
    }
    
    // Listen for overlay state changes from other tabs
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      
      // Handle overlay state response
      if (event.data.type === 'SPEEDY_OVERLAY_STATE_RESPONSE') {
        console.log('📨 [Overlay] Received overlay state response:', event.data.state);
        console.log('📨 [Overlay] Current isVisible:', isVisible);
        const state = event.data.state;
        if (state && state.isVisible && !isVisible) {
          console.log('✅ [Overlay] State says visible=true, opening overlay');
          // If overlay was open in another tab, open it here too
          setTimeout(() => {
            toggleOverlay();
          }, 100);
        } else {
          console.log('⏭️ [Overlay] No action needed. State visible:', state?.isVisible, 'Current visible:', isVisible);
          // State loaded, now we can safely initialize FAB visibility
          setTimeout(() => {
            initializeFABVisibility();
          }, 100);
        }
      }
      
      // Handle overlay state changes from other tabs
      if (event.data.type === 'SPEEDY_OVERLAY_STATE_CHANGED') {
        console.log('🔄 [Overlay] Received state change from another tab:', event.data.state);
        console.log('🔄 [Overlay] Current isVisible:', isVisible);
        const newState = event.data.state;
        if (newState && newState.isVisible !== isVisible) {
          console.log('✅ [Overlay] State mismatch! Syncing... New state:', newState.isVisible);
          // Sync state with other tabs
          toggleOverlay();
        } else {
          console.log('⏭️ [Overlay] States match, no sync needed');
        }
      }
    });
    
    // Load state on init
    console.log('🚀 [Overlay] Initializing overlay state sync');
    loadOverlayState();
    
    // Fallback: If no state response comes back after 1 second, show FAB
    setTimeout(() => {
      // Only initialize if overlay is still not visible (state never loaded)
      if (!isVisible && isMinimized) {
        console.log('⏱️ [Overlay] State response timeout, initializing FAB as fallback');
        initializeFABVisibility();
      }
    }, 1000);
    
    let availableTabs = [];
    let selectedModel = 'anthropic/claude-3.5-sonnet';
    let availableModels = [];
    let modelsLoading = true;
    let currentChatId = null;
    let messages = [];
    let isStreaming = false;
    let capturedScreenshots = [];
    let allChats = [];
    let searchDebounceTimer = null;
    let tabSearchQuery = '';
    
    // Fallback models list (main models only)
    const fallbackModels = [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'openai/gpt-4-turbo',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-haiku',
      'google/gemini-pro-1.5',
      'google/gemini-flash-1.5',
      'x-ai/grok-beta'
    ];
    
    // Placeholder handling for contenteditable
    function updatePlaceholder() {
      const placeholder = input.getAttribute('data-placeholder');
      
      // Clean up empty input - remove any <br> tags if text is empty
      if (input.textContent.trim() === '') {
        input.innerHTML = '';
      }
      
      if (input.textContent.trim() === '') {
        input.style.setProperty('--placeholder-visible', 'block');
        if (!input.hasAttribute('data-placeholder-added')) {
          const style = document.createElement('style');
          style.textContent = `
            #speedy-input:empty:before {
              content: attr(data-placeholder);
              color: rgba(255, 255, 255, 0.5);
              opacity: 0.5;
              pointer-events: none;
            }
          `;
          shadowRoot.appendChild(style);
          input.setAttribute('data-placeholder-added', 'true');
        }
      }
    }
    // ====== RESIZE: PERSISTENCE HELPERS ======
    function getHostKey() {
      try {
        return location.hostname || 'default';
      } catch (e) {
        return 'default';
      }
    }

    function loadSavedSize() {
      const key = `speedy_overlay_size_${getHostKey()}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }

    function saveSize(width, height) {
      const key = `speedy_overlay_size_${getHostKey()}`;
      const value = JSON.stringify({ width, height });
      localStorage.setItem(key, value);
    }

    
    updatePlaceholder();
    
    // ====== RESIZE FUNCTIONALITY ======
    
    let isResizing = false;
    let resizeDirection = '';
    let resizeStart = { x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 };
    
    // Start resizing or dragging from handle
    function startResize(e, direction) {
      e.preventDefault();
      e.stopPropagation();
      
      isResizing = true;
      resizeDirection = direction;
      
      const rect = overlay.getBoundingClientRect();
      resizeStart.x = e.clientX;
      resizeStart.y = e.clientY;
      resizeStart.width = rect.width;
      resizeStart.height = rect.height;
      resizeStart.left = rect.left;
      resizeStart.top = rect.top;
      
      // Store initial drag offset for potential dragging
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      
      overlay.style.transition = 'none';
      document.body.style.cursor = e.target.style.cursor;
      
      document.addEventListener('mousemove', onResize);
      document.addEventListener('mouseup', stopResize);
    }
    
    // Resizing
    function onResize(e) {
      if (!isResizing) return;
      
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newLeft = resizeStart.left;
      let newTop = resizeStart.top;
      
      // Minimum dimensions
      const minWidth = 350;
      const minHeight = 250;
      const maxWidth = window.innerWidth - 20;
      const maxHeight = window.innerHeight - 20;
      
      // Handle different resize directions
      switch (resizeDirection) {
        case 'se': // Southeast (bottom-right)
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + dx));
          newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + dy));
          break;
          
        case 'sw': // Southwest (bottom-left)
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - dx));
          newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + dy));
          newLeft = resizeStart.left + (resizeStart.width - newWidth);
          break;
          
        case 'ne': // Northeast (top-right)
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + dx));
          newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - dy));
          newTop = resizeStart.top + (resizeStart.height - newHeight);
          break;
          
        case 'nw': // Northwest (top-left)
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - dx));
          newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - dy));
          newLeft = resizeStart.left + (resizeStart.width - newWidth);
          newTop = resizeStart.top + (resizeStart.height - newHeight);
          break;
          
        case 'n': // North (top)
          newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - dy));
          newTop = resizeStart.top + (resizeStart.height - newHeight);
          break;
          
        case 's': // South (bottom)
          newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + dy));
          break;
          
        case 'e': // East (right)
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + dx));
          break;
          
        case 'w': // West (left)
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - dx));
          newLeft = resizeStart.left + (resizeStart.width - newWidth);
          break;
      }
      
      // Apply new dimensions and position
      overlay.style.width = `${newWidth}px`;
      overlay.style.maxHeight = `${newHeight}px`;
      form.style.maxHeight = `${newHeight}px`;
      
      if (newLeft !== resizeStart.left || newTop !== resizeStart.top) {
        overlay.style.left = `${newLeft}px`;
        overlay.style.top = `${newTop}px`;
      }
    }
    
    // Stop resizing
    function stopResize() {
      if (!isResizing) return;
      
      isResizing = false;
      resizeDirection = '';
      overlay.style.transition = '';
      document.body.style.cursor = '';
      
      document.removeEventListener('mousemove', onResize);
      document.removeEventListener('mouseup', stopResize);
      
      // Save size
      const rect = overlay.getBoundingClientRect();
      saveSize(rect.width, rect.height);
    }
    
    // Attach resize handlers
    const resizeHandles = shadowRoot.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => {
      const direction = handle.classList[1].replace('resize-', '');
      handle.addEventListener('mousedown', (e) => startResize(e, direction));
    });
    
    // ====== END RESIZE FUNCTIONALITY ======
    
    // ====== FAB (Floating Action Button) FUNCTIONALITY ======
    
    // FAB click handler - expand to full overlay
    fab.addEventListener('click', () => {
      if (isMinimized) {
        toggleOverlay();
      }
    });
    
    // FAB hover effects
    fab.addEventListener('mouseenter', () => {
      fab.style.transform = 'translateX(-50%) scale(1.1)';
      fab.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    });
    
    fab.addEventListener('mouseleave', () => {
      fab.style.transform = 'translateX(-50%) scale(1)';
      fab.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
    });
    
    // Initialize: Show FAB only after state is loaded and overlay is confirmed to be hidden
    function initializeFABVisibility() {
      // Only show FAB if overlay is not visible
      if (!isVisible && isMinimized) {
        fab.style.opacity = '1';
        fab.style.transform = 'translateX(-50%) scale(1)';
        fab.style.pointerEvents = 'auto';
      }
    }
    
    // ====== END FAB FUNCTIONALITY ======
    
    // ====== SEND BUTTON ANIMATIONS ======
    
    // Hover animation for send button
    button.addEventListener('mouseenter', () => {
      if (!button.disabled) {
        button.style.transform = 'scale(1.1)';
        button.style.color = 'rgba(255, 255, 255, 0.9)';
        sendIcon.style.transform = 'translateX(2px) translateY(-2px) rotate(-5deg)';
      }
    });
    
    button.addEventListener('mouseleave', () => {
      if (!button.disabled) {
        button.style.transform = 'scale(1)';
        button.style.color = 'rgba(255, 255, 255, 0.5)';
        sendIcon.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
      }
    });
    
    // Click animation for send button
    button.addEventListener('mousedown', () => {
      if (!button.disabled) {
        button.style.transform = 'scale(0.95)';
      }
    });
    
    button.addEventListener('mouseup', () => {
      if (!button.disabled) {
        button.style.transform = 'scale(1.1)';
      }
    });
    
    // Send animation when form is submitted
    function animateSend() {
      // Fly away animation
      sendIcon.style.transform = 'translateX(20px) translateY(-20px) rotate(45deg)';
      sendIcon.style.opacity = '0';
      
      // Reset after animation
      setTimeout(() => {
        sendIcon.style.transition = 'none';
        sendIcon.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
        sendIcon.style.opacity = '1';
        
        // Re-enable transition
        setTimeout(() => {
          sendIcon.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 50);
      }, 300);
    }
    
    // ====== END SEND BUTTON ANIMATIONS ======
    
    // ====== PAPERCLIP BUTTON ANIMATIONS ======
    
    // Hover animation for paperclip button (attach file)
    imageUploadBtn.addEventListener('mouseenter', () => {
      imageUploadBtn.style.transform = 'scale(1.15)';
      imageUploadBtn.style.color = 'rgba(255, 255, 255, 1)';
      // Rotate and wiggle animation
      paperclipIcon.style.transform = 'rotate(-15deg) translateY(-1px)';
      
      // Add a subtle wiggle effect
      setTimeout(() => {
        paperclipIcon.style.transform = 'rotate(15deg) translateY(-1px)';
      }, 100);
      
      setTimeout(() => {
        paperclipIcon.style.transform = 'rotate(-10deg) translateY(-1px)';
      }, 200);
    });
    
    imageUploadBtn.addEventListener('mouseleave', () => {
      imageUploadBtn.style.transform = 'scale(1)';
      imageUploadBtn.style.color = 'rgba(255, 255, 255, 0.9)';
      paperclipIcon.style.transform = 'rotate(0deg) translateY(0)';
    });
    
    // Click animation for paperclip button
    imageUploadBtn.addEventListener('mousedown', () => {
      imageUploadBtn.style.transform = 'scale(0.9)';
      paperclipIcon.style.transform = 'rotate(-25deg)';
    });
    
    imageUploadBtn.addEventListener('mouseup', () => {
      imageUploadBtn.style.transform = 'scale(1.15)';
      paperclipIcon.style.transform = 'rotate(-10deg) translateY(-1px)';
    });
    
    // ====== END PAPERCLIP BUTTON ANIMATIONS ======
    
    // ====== CROP BUTTON ANIMATIONS ======
    
    // Hover animation for crop button (screenshot capture)
    screenshotBtn.addEventListener('mouseenter', () => {
      screenshotBtn.style.transform = 'scale(1.15)';
      screenshotBtn.style.color = 'rgba(255, 255, 255, 1)';
      // Expand and contract animation (like cropping in/out)
      cropIcon.style.transform = 'scale(1.2)';
      
      // Pulse effect
      setTimeout(() => {
        cropIcon.style.transform = 'scale(0.9)';
      }, 100);
      
      setTimeout(() => {
        cropIcon.style.transform = 'scale(1.15)';
      }, 200);
    });
    
    screenshotBtn.addEventListener('mouseleave', () => {
      screenshotBtn.style.transform = 'scale(1)';
      screenshotBtn.style.color = 'rgba(255, 255, 255, 0.9)';
      cropIcon.style.transform = 'scale(1)';
    });
    
    // Click animation for crop button
    screenshotBtn.addEventListener('mousedown', () => {
      screenshotBtn.style.transform = 'scale(0.85)';
      cropIcon.style.transform = 'scale(0.7)';
    });
    
    screenshotBtn.addEventListener('mouseup', () => {
      screenshotBtn.style.transform = 'scale(1.15)';
      cropIcon.style.transform = 'scale(1.15)';
    });
    
    // ====== END CROP BUTTON ANIMATIONS ======
    
    // Fetch available models
    async function fetchModels() {
      try {
        const data = await apiRequest('GET', '/api/openrouter/models');
        
        if (data.data && Array.isArray(data.data)) {
          // Filter to only include main models (no dev/preview models like haiku)
          const mainModels = [
            // OpenAI - main models only
            'openai/gpt-4o',
            'openai/gpt-4o-mini',
            'openai/gpt-4-turbo',
            'openai/chatgpt-4o-latest',
            'openai/o1',
            'openai/o1-mini',
            
            // Anthropic - main Claude models (Opus and Sonnet only, no Haiku)
            'anthropic/claude-3.5-sonnet',
            'anthropic/claude-3-opus',
            'anthropic/claude-opus-4-20250514',
            
            // Google - main Gemini models
            'google/gemini-pro-1.5',
            'google/gemini-flash-1.5',
            'google/gemini-2.0-flash-exp',
            
            // X.AI - main Grok models
            'x-ai/grok-beta',
            'x-ai/grok-2-1212',
            'x-ai/grok-2'
          ];
          
          const filteredModels = data.data.filter(model => {
            return mainModels.includes(model.id);
          });
          
          // Sort models by provider and then by name
          availableModels = filteredModels.sort((a, b) => {
            const providerA = a.id.split('/')[0];
            const providerB = b.id.split('/')[0];
            
            // Sort by provider first
            if (providerA !== providerB) {
              const providerOrder = ['openai', 'anthropic', 'google', 'x-ai'];
              return providerOrder.indexOf(providerA) - providerOrder.indexOf(providerB);
            }
            
            // Then sort by name within provider
            const nameA = (a.name || a.id).toLowerCase();
            const nameB = (b.name || b.id).toLowerCase();
            return nameA.localeCompare(nameB);
          });
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        availableModels = fallbackModels.map(id => ({ 
          id, 
          name: id.split('/').pop()
        }));
      } finally {
        modelsLoading = false;
        updateModelDisplay();
        renderModels();
      }
    }
    
    // Get model display name
    function getModelDisplayName(modelId) {
      const model = availableModels.find(m => m.id === modelId);
      if (model?.name) {
        // Extract short name from full name
        const name = model.name.toLowerCase();
        if (name.includes('sonnet')) return 'sonnet';
        if (name.includes('opus')) return 'opus';
        if (name.includes('gpt-4o')) return 'gpt-4o';
        if (name.includes('gpt-4')) return 'gpt-4';
        if (name.includes('chatgpt')) return 'chatgpt';
        if (name.includes('o1')) return 'o1';
        if (name.includes('gemini')) {
          if (name.includes('flash')) return 'gemini-flash';
          if (name.includes('pro')) return 'gemini-pro';
          return 'gemini';
        }
        if (name.includes('grok')) return 'grok';
        return model.name;
      }
      // Format the ID nicely - extract last part
      const parts = modelId.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('sonnet')) return 'sonnet';
      if (lastPart.includes('opus')) return 'opus';
      if (lastPart.includes('gpt-4o')) return 'gpt-4o';
      if (lastPart.includes('gpt-4')) return 'gpt-4';
      if (lastPart.includes('chatgpt')) return 'chatgpt';
      if (lastPart.includes('o1')) return 'o1';
      if (lastPart.includes('gemini')) return 'gemini';
      if (lastPart.includes('grok')) return 'grok';
      return lastPart.split('-')[0];
    }
    
    // Update model display
    function updateModelDisplay() {
      if (modelsLoading) {
        modelName.textContent = 'Loading...';
      } else {
        modelName.textContent = getModelDisplayName(selectedModel);
      }
    }
    
    // Render models in dropdown
    function renderModels() {
      allModelsContainer.innerHTML = '';
      
      // Simply render all available models in order
      availableModels.forEach(model => {
        const modelButton = createModelButton(model);
        allModelsContainer.appendChild(modelButton);
      });
    }
    
    // Create model button
    function createModelButton(model) {
      const button = document.createElement('button');
      button.type = 'button';
      const isSelected = selectedModel === model.id;
      
      // Get provider and model name
      const [provider, ...modelParts] = model.id.split('/');
      const modelName = modelParts.join('/');
      
      // Create a nice display name
      let displayName = model.name || modelName;
      
      // Format provider name
      const providerMap = {
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'google': 'Google',
        'x-ai': 'xAI'
      };
      const providerDisplay = providerMap[provider] || provider;
      
      // Clean up model name for better readability
      let cleanModelName = displayName;
      if (displayName.toLowerCase().includes('claude')) {
        cleanModelName = displayName.replace(/claude-/i, 'Claude ').replace(/-/g, ' ');
      } else if (displayName.toLowerCase().includes('gpt')) {
        cleanModelName = displayName.replace(/gpt-/i, 'GPT-').replace(/-/g, ' ');
      } else if (displayName.toLowerCase().includes('gemini')) {
        cleanModelName = displayName.replace(/gemini-/i, 'Gemini ').replace(/-/g, ' ');
      } else if (displayName.toLowerCase().includes('grok')) {
        cleanModelName = displayName.replace(/grok-/i, 'Grok ').replace(/-/g, ' ');
      }
      
      // Create button with provider badge
      button.style.cssText = `
        width: 100%;
        text-align: left;
        padding: 8px 10px;
        font-size: 13px;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        border-radius: 8px;
        border: none;
        background: ${isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'};
        color: ${isSelected ? 'rgb(37, 99, 235)' : 'rgb(55, 65, 81)'};
        cursor: pointer;
        transition: background 0.1s;
        font-weight: ${isSelected ? '600' : '500'};
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: auto;
      `;
      
      // Add provider badge
      const badge = document.createElement('span');
      badge.style.cssText = `
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.05);
        color: rgba(0, 0, 0, 0.6);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      `;
      badge.textContent = providerDisplay;
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = cleanModelName;
      nameSpan.style.flex = '1';
      
      button.appendChild(badge);
      button.appendChild(nameSpan);
      
      button.addEventListener('mouseenter', () => {
        if (!isSelected) {
          button.style.background = 'rgba(243, 244, 246, 1)';
        }
      });
      
      button.addEventListener('mouseleave', () => {
        if (!isSelected) {
          button.style.background = 'transparent';
        }
      });
      
      button.addEventListener('click', () => {
        selectedModel = model.id;
        updateModelDisplay();
        renderModels();
        closeModelMenu();
      });
      
      return button;
    }
    
    function closeModelMenu() {
      modelMenu.style.display = 'none';
      modelChevron.style.transform = 'rotate(0deg)';
      modelSelector.style.background = 'transparent';
    }
    
    function openModelMenu() {
      console.log('🔧 [Overlay] openModelMenu called', {
        menuElement: modelMenu,
        menuDisplay: modelMenu.style.display,
        menuChildCount: modelMenu.children.length,
        allModelsChildCount: allModelsContainer.children.length,
        availableModelsCount: availableModels.length
      });
      modelMenu.style.display = 'block';
      modelChevron.style.transform = 'rotate(180deg)';
      modelSelector.style.background = 'rgba(255, 255, 255, 0.05)';
      console.log('🔧 [Overlay] Menu display set to block, computed style:', window.getComputedStyle(modelMenu).display);
    }
    
    // ========== CHAT FUNCTIONS ==========
    
    async function ensureChat() {
      if (currentChatId) return currentChatId;
      
      // Check if we have a saved chat ID in localStorage
      const savedChatId = localStorage.getItem('speedy_last_chat_id');
      if (savedChatId) {
        try {
          // Verify the chat still exists
          const chat = await apiRequest('GET', `/api/chats/${savedChatId}`);
          if (chat) {
            currentChatId = savedChatId;
            await loadChatMessages(savedChatId);
            return currentChatId;
          }
        } catch (error) {
          console.log('Saved chat not found, creating new one');
          localStorage.removeItem('speedy_last_chat_id');
        }
      }
      
      try {
        const chat = await apiRequest('POST', '/api/chats', {
          title: 'New Chat',
          model: selectedModel
        });
        currentChatId = chat._id;
        localStorage.setItem('speedy_last_chat_id', currentChatId);
        await loadChats();
        return currentChatId;
      } catch (error) {
        console.error('Error creating chat:', error);
        return null;
      }
    }
    
    function addMessageToUI(role, content, isStreaming = false) {
      // Always show the messages list when adding messages
      messagesList.style.display = 'flex';
      
      const wrapper = document.createElement('div');
      wrapper.className = `speedy-message-wrapper ${role}`;
      
      const contentContainer = document.createElement('div');
      contentContainer.className = 'speedy-message-content';
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `speedy-message speedy-message-${role}`;
      if (isStreaming) {
        messageDiv.classList.add('speedy-message-streaming');
      }
      
      messageDiv.innerHTML = formatMessage(content, role);
      
      const timestamp = document.createElement('span');
      timestamp.className = 'speedy-message-timestamp';
      const now = new Date();
      timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      contentContainer.appendChild(messageDiv);
      contentContainer.appendChild(timestamp);
      wrapper.appendChild(contentContainer);
      
      messagesList.appendChild(wrapper);
      scrollToBottom();
      
      return messageDiv;
    }
    
    function formatMessage(content, role) {
      if (!content) return '';
      
      if (role === 'user') {
        return escapeHtml(content);
      }
      
      let formatted = escapeHtml(content);
      formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
      formatted = formatted.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
      formatted = formatted.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
      
      return formatted;
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function updateStreamingMessage(messageDiv, content) {
      const role = messageDiv.classList.contains('speedy-message-user') ? 'user' : 'assistant';
      messageDiv.innerHTML = formatMessage(content, role);
      scrollToBottom();
    }
    
    function scrollToBottom() {
      messagesList.scrollTop = messagesList.scrollHeight;
    }
    
    async function sendMessageToAPI(messageText, contexts = []) {
      const chatId = await ensureChat();
      if (!chatId) {
        console.error('Failed to create chat');
        return;
      }
      
      // Track message sent
      analytics.trackEvent('chat_message_sent', {
        messageLength: messageText.length,
        hasContext: contexts.length > 0,
        contextCount: contexts.length
      });
      
      addMessageToUI('user', messageText);
      
      await apiRequest('POST', `/api/chats/${chatId}/message`, {
        role: 'user',
        content: messageText,
        context: contexts
      });
      
      const chatData = await apiRequest('GET', `/api/chats/${chatId}`);
      
      const apiMessages = chatData.messages.map(msg => ({
        role: msg.role,
        content: buildMessageContent(msg.content, msg.context)
      }));
      
      isStreaming = true;
      const streamingMessageDiv = addMessageToUI('assistant', '', true);
      let fullResponse = '';
      
      try {
        // Get the full response from API
        const response = await apiRequest('POST', '/api/openrouter/chat', {
          messages: apiMessages,
          model: selectedModel,
          stream: false
        });
        
        // Extract the response content
        if (response.choices && response.choices[0] && response.choices[0].message) {
          fullResponse = response.choices[0].message.content;
          
          // Simulate streaming by showing text gradually with auto-scroll
          await simulateStreamingText(streamingMessageDiv, fullResponse);
        }
        
        await apiRequest('POST', `/api/chats/${chatId}/message`, {
          role: 'assistant',
          content: fullResponse,
          context: []
        });
        
        streamingMessageDiv.classList.remove('speedy-message-streaming');
        
        // Auto-generate title after first assistant response
        const chatData = await apiRequest('GET', `/api/chats/${chatId}`);
        if (chatData.messages.length === 2 && chatData.title === 'New Chat') {
          console.log('🏷️ [Overlay] Auto-generating chat title...');
          try {
            await apiRequest('POST', `/api/chats/${chatId}/generate-title`);
            console.log('✅ [Overlay] Chat title generated successfully');
          } catch (error) {
            console.error('❌ [Overlay] Failed to generate chat title:', error);
          }
        }
        
        // Reload chats to update the sidebar
        if (allChats.length > 0) {
          await loadChats();
        }
        
      } catch (error) {
        console.error('Error streaming response:', error);
        streamingMessageDiv.textContent = 'Error: Failed to get response';
      } finally {
        isStreaming = false;
      }
    }
    
    // Simulate streaming text effect with auto-scroll
    async function simulateStreamingText(messageDiv, fullText) {
      const words = fullText.split(' ');
      let displayedText = '';
      
      for (let i = 0; i < words.length; i++) {
        displayedText += (i > 0 ? ' ' : '') + words[i];
        updateStreamingMessage(messageDiv, displayedText);
        
        // Auto-scroll as text appears - keep user following the text
        scrollToBottom();
        
        // Delay between words for streaming effect (30ms = smooth but fast)
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }
    
    function buildMessageContent(content, context = []) {
      if (!context || context.length === 0) return content;
      
      let contextText = '<additional_information>\n';
      contextText += 'Below is additional context information:\n\n';
      
      for (const ctx of context) {
        if (ctx.type === 'tab') {
          contextText += `<content source="webpage" title="${ctx.data.title}" url="${ctx.data.url}">\n`;
          contextText += `${ctx.data.content}\n</content>\n\n`;
        }
      }
      
      contextText += '</additional_information>\n\n';
      return contextText + content;
    }
    
    // ========== CHAT SIDEBAR FUNCTIONS ==========
    
    async function loadChats(searchQuery = '') {
      try {
        const endpoint = searchQuery 
          ? `/api/chats?search=${encodeURIComponent(searchQuery)}`
          : '/api/chats';
        
        const response = await apiRequest('GET', endpoint);
        allChats = response.chats || response; // Handle both paginated and non-paginated responses
        renderChatList();
      } catch (error) {
        console.error('Error loading chats:', error);
        chatList.innerHTML = `
          <div class="speedy-empty-state">
            <div class="speedy-empty-state-icon">⚠️</div>
            <div>Failed to load chats</div>
          </div>
        `;
      }
    }
    
    function renderChatList() {
      if (allChats.length === 0) {
        chatList.innerHTML = `
          <div class="speedy-empty-state">
            <div class="speedy-empty-state-icon">💬</div>
            <div>No chats yet</div>
            <div style="font-size: 12px; margin-top: 8px;">Start a new conversation!</div>
          </div>
        `;
        return;
      }
      
      chatList.innerHTML = '';
      
      allChats.forEach(chat => {
        const chatItem = createChatItem(chat);
        chatList.appendChild(chatItem);
      });
    }
    
    function createChatItem(chat) {
      const item = document.createElement('div');
      item.className = 'speedy-chat-item';
      if (chat._id === currentChatId) {
        item.classList.add('active');
      }
      
      const lastMessage = chat.messages && chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content 
        : 'No messages yet';
      
      const messageCount = chat.messages ? chat.messages.length : 0;
      const date = new Date(chat.updatedAt);
      const timeAgo = getTimeAgo(date);
      
      item.innerHTML = `
        <div class="speedy-chat-item-title">${escapeHtml(chat.title)}</div>
        <div class="speedy-chat-item-preview">${escapeHtml(lastMessage.substring(0, 60))}${lastMessage.length > 60 ? '...' : ''}</div>
        <div class="speedy-chat-item-meta">
          <span>${messageCount} messages</span>
          <span>${timeAgo}</span>
        </div>
        <div class="speedy-chat-item-actions">
          <button class="speedy-chat-action-btn" data-action="rename" title="Rename">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="speedy-chat-action-btn" data-action="export" title="Export">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button class="speedy-chat-action-btn" data-action="delete" title="Delete">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;
      
      // Click to switch chat
      item.addEventListener('click', async (e) => {
        if (e.target.closest('.speedy-chat-action-btn')) return;
        await switchToChat(chat._id);
      });
      
      // Action buttons
      const actionBtns = item.querySelectorAll('.speedy-chat-action-btn');
      actionBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          
          if (action === 'delete') {
            await deleteChat(chat._id);
          } else if (action === 'rename') {
            await renameChat(chat._id, chat.title);
          } else if (action === 'export') {
            await exportChat(chat._id);
          }
        });
      });
      
      return item;
    }
    
    async function switchToChat(chatId) {
      if (chatId === currentChatId) {
        closeSidebar();
        return;
      }
      
      currentChatId = chatId;
      localStorage.setItem('speedy_last_chat_id', chatId);
      
      // Clear current messages
      messagesList.innerHTML = '';
      messages = [];
      
      // Load chat messages
      await loadChatMessages(chatId);
      
      // Update UI
      renderChatList();
      closeSidebar();
    }
    
    async function loadChatMessages(chatId) {
      try {
        const chat = await apiRequest('GET', `/api/chats/${chatId}`);
        
        if (chat.messages && chat.messages.length > 0) {
          messagesList.style.display = 'flex';
          chat.messages.forEach(msg => {
            addMessageToUI(msg.role, msg.content, false);
          });
          messages = chat.messages;
        } else {
          messagesList.style.display = 'none';
        }
        
        // Update model if different
        if (chat.model && chat.model !== selectedModel) {
          selectedModel = chat.model;
          updateModelDisplay();
        }
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    }
    
    async function createNewChat() {
      try {
        const chat = await apiRequest('POST', '/api/chats', {
          title: 'New Chat',
          model: selectedModel
        });
        
        currentChatId = chat._id;
        localStorage.setItem('speedy_last_chat_id', currentChatId);
        
        // Clear messages
        messagesList.innerHTML = '';
        messagesList.style.display = 'none';
        messages = [];
        
        // Clear selected tabs and context chips
        selectedTabs = [];
        clearAllContextChips();
        
        // Clear screenshots
        capturedScreenshots = [];
        
        // Reload tabs to trigger auto-select of current tab
        loadAvailableTabs();
        
        // Reload chat list
        await loadChats();
        closeSidebar();
      } catch (error) {
        console.error('Error creating new chat:', error);
      }
    }
    
    async function deleteChat(chatId) {
      const modal = createModal(
        'Delete Chat',
        'Are you sure you want to delete this chat? This action cannot be undone.',
        [
          { text: 'Cancel', class: 'speedy-modal-btn speedy-modal-btn-secondary', action: 'close' },
          { text: 'Delete', class: 'speedy-modal-btn speedy-modal-btn-danger', action: 'confirm' }
        ]
      );
      
      shadowRoot.appendChild(modal);
      
      const confirmed = await new Promise(resolve => {
        modal.querySelectorAll('.speedy-modal-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            resolve(btn.textContent === 'Delete');
            modal.remove();
          });
        });
      });
      
      if (!confirmed) return;
      
      try {
        await apiRequest('DELETE', `/api/chats/${chatId}`);
        
        // If deleted current chat, create a new one
        if (chatId === currentChatId) {
          await createNewChat();
        } else {
          await loadChats();
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
    
    async function renameChat(chatId, currentTitle) {
      const modal = createModal(
        'Rename Chat',
        `<input type="text" class="speedy-modal-input" id="rename-input" value="${escapeHtml(currentTitle)}" placeholder="Enter new title">`,
        [
          { text: 'Cancel', class: 'speedy-modal-btn speedy-modal-btn-secondary', action: 'close' },
          { text: 'Rename', class: 'speedy-modal-btn speedy-modal-btn-primary', action: 'confirm' }
        ]
      );
      
      shadowRoot.appendChild(modal);
      
      const input = modal.querySelector('#rename-input');
      input.focus();
      input.select();
      
      const result = await new Promise(resolve => {
        const handleAction = (confirmed) => {
          const newTitle = input.value.trim();
          resolve(confirmed && newTitle ? newTitle : null);
          modal.remove();
        };
        
        modal.querySelectorAll('.speedy-modal-btn').forEach(btn => {
          btn.addEventListener('click', () => handleAction(btn.textContent === 'Rename'));
        });
        
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAction(true);
          } else if (e.key === 'Escape') {
            handleAction(false);
          }
        });
      });
      
      if (!result) return;
      
      try {
        await apiRequest('PATCH', `/api/chats/${chatId}/title`, { title: result });
        await loadChats();
      } catch (error) {
        console.error('Error renaming chat:', error);
      }
    }
    
    async function exportChat(chatId) {
      try {
        const chat = await apiRequest('GET', `/api/chats/${chatId}`);
        
        // Export as JSON
        const dataStr = JSON.stringify(chat, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting chat:', error);
      }
    }
    
    function createModal(title, content, buttons) {
      const overlay = document.createElement('div');
      overlay.className = 'speedy-modal-overlay';
      
      const modal = document.createElement('div');
      modal.className = 'speedy-modal';
      
      modal.innerHTML = `
        <div class="speedy-modal-title">${title}</div>
        <div>${content}</div>
        <div class="speedy-modal-actions">
          ${buttons.map(btn => `<button class="${btn.class}">${btn.text}</button>`).join('')}
        </div>
      `;
      
      overlay.appendChild(modal);
      
      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove();
        }
      });
      
      return overlay;
    }
    
    function getTimeAgo(date) {
      const seconds = Math.floor((new Date() - date) / 1000);
      
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      
      return date.toLocaleDateString();
    }
    
    function toggleSidebar() {
      chatSidebar.classList.toggle('open');
    }
    
    function closeSidebar() {
      chatSidebar.classList.remove('open');
    }
    
    function openSidebar() {
      chatSidebar.classList.add('open');
    }
    
    // Toggle overlay visibility (expand/minimize with FAB)
    function toggleOverlay() {
      console.log('🎯 [Overlay] toggleOverlay called');
      console.log('🎯 [Overlay] Before toggle - isVisible:', isVisible, 'isMinimized:', isMinimized);
      isVisible = !isVisible;
      console.log('🎯 [Overlay] After toggle - isVisible:', isVisible);
      
      // Save state to sync across tabs
      saveOverlayState(isVisible);
      
      if (isVisible) {
        // Expand: Hide FAB, show full overlay
        isMinimized = false;
        
        // First hide FAB
        fab.style.opacity = '0';
        fab.style.transform = 'translateX(-50%) scale(0)';
        fab.style.pointerEvents = 'none';
        
        // Then show overlay after a short delay
        setTimeout(() => {
        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
        overlay.style.pointerEvents = 'auto';
          
          // Apply saved size if exists
          const savedSize = loadSavedSize();
          if (savedSize && (savedSize.width || savedSize.height)) {
            if (savedSize.width) overlay.style.width = `${savedSize.width}px`;
            if (savedSize.height) {
              overlay.style.maxHeight = `${savedSize.height}px`;
              form.style.maxHeight = `${savedSize.height}px`;
            }
          }
        
        loadAvailableTabs();
        
          // Focus input immediately for instant typing
          requestAnimationFrame(() => {
          input.focus();
            // Move cursor to end of content if any exists
            const range = document.createRange();
            const sel = window.getSelection();
            if (input.childNodes.length > 0) {
              range.setStart(input.childNodes[input.childNodes.length - 1], input.textContent.length);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          });
        }, 150);
      } else {
        // Minimize: Shrink overlay into FAB
        isMinimized = true;
        
        // Add shrink animation to overlay
        overlay.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        overlay.style.transform = 'translateX(-50%) translateY(20px) scale(0)';
        overlay.style.opacity = '0';
        
        // Wait for shrink animation to complete
        setTimeout(() => {
          overlay.classList.remove('visible');
          overlay.classList.add('hidden');
          overlay.style.pointerEvents = 'none';
          overlay.classList.remove('hidden');
          
          // Reset overlay transform for next time
          overlay.style.transform = 'translateX(-50%) translateY(20px)';
          overlay.style.transition = '';
          
          // Show FAB after overlay shrinks
          fab.style.opacity = '1';
          fab.style.transform = 'translateX(-50%) scale(1)';
          fab.style.pointerEvents = 'auto';
        }, 300);
        
        tabMenu.style.display = 'none';
        closeModelMenu();
        
        input.textContent = '';
        message = '';
        button.disabled = true;
        button.style.color = 'rgba(255, 255, 255, 0.5)';
      }
    }
    
    async function loadAvailableTabs() {
      console.log('🔍 [Overlay] Requesting tabs from content script...');
      window.postMessage({
        type: 'SPEEDY_GET_TABS'
      }, '*');
    }
    
    // Clear all context chips from UI
    function clearAllContextChips() {
      console.log('🗑️ [Overlay] Clearing all context chips from UI');
      contextPills.innerHTML = '';
    }
    
    // Remove specific chip by tab ID
    function removeContextChip(tabId) {
      console.log('🗑️ [Overlay] Removing chip for tab:', tabId);
      const chipWrapper = contextPills.querySelector(`[data-tab-id="${tabId}"]`)?.parentElement;
      if (chipWrapper) {
        chipWrapper.remove();
        console.log('✅ [Overlay] Chip removed from DOM');
      } else {
        console.warn('⚠️ [Overlay] Chip not found in DOM');
      }
    }
    
    // Add a context chip to the UI
    function addContextChip(tab) {
      console.log('➕ [Overlay] Adding context chip for tab:', { id: tab.id, title: tab.title });
      
      // Check if chip already exists
      if (contextPills.querySelector(`[data-tab-id="${tab.id}"]`)) {
        console.log('⚠️ [Overlay] Chip already exists, skipping');
        return;
      }
      
      // Truncate title
      const maxLength = 11;
      const titleText = tab.title.length > maxLength ? tab.title.substring(0, maxLength) : tab.title;
      const hasEllipsis = tab.title.length > maxLength;
      
      // Favicon
      const favicon = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>';
      
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: inline-flex; gap: 3px; align-items: center;';
      
      // Create pill container
      const pillContainer = document.createElement('div');
      pillContainer.tabIndex = 0;
      pillContainer.dataset.tabId = tab.id;
      pillContainer.style.cssText = `
        display: inline-flex;
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        flex-shrink: 0;
        position: relative;
        outline: none;
        visibility: visible;
      `;
      
      // Create chip
      const chip = document.createElement('div');
      chip.className = 'context-chip';
      chip.style.cssText = `
        transition-property: opacity;
        transition-duration: 0.2s;
        transition-timing-function: ease;
        position: relative;
        cursor: pointer;
        border-style: dashed;
        border-width: 1px;
        border-color: rgba(228, 228, 228, 0.124);
        opacity: 1;
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 0 6px;
        border-radius: 4px;
        background: transparent;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 10px;
        line-height: 18px;
        color: rgba(228, 228, 228, 0.55);
        user-select: none;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: visible;
        box-sizing: border-box;
        height: 18px;
        min-height: 18px;
        max-height: 18px;
      `;
      
      chip.innerHTML = `
        <div style="width: 18px; margin-left: -3px; margin-right: -2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative;">
          <span class="chip-favicon" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transition: opacity 150ms; opacity: 1;">
            <img src="${favicon}" style="width: 15px; height: 15px; border-radius: 2px; object-fit: contain;" />
          </span>
          <span class="chip-close-icon" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transition: opacity 75ms; opacity: 0;">
            <button class="remove-chip" style="
              padding: 0;
              margin: 0;
              background: none;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 14px;
              height: 14px;
              color: rgba(255, 255, 255, 0.3);
              transition: color 75ms;
              line-height: 0;
            " title="Remove context">
              <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor" style="display: block;">
                <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"/>
              </svg>
            </button>
          </span>
        </div>
        <div style="flex-shrink: 0; opacity: 1; color: rgba(255, 255, 255, 0.9); font-size: 11px; line-height: 22px; display: flex; align-items: baseline;">
          <span>${titleText}</span>${hasEllipsis ? '<span style="font-weight: 200; opacity: 0.7;">...</span>' : ''}
        </div>
      `;
      
      // Hover effects
      chip.addEventListener('mouseenter', () => {
        const favicon = chip.querySelector('.chip-favicon');
        const closeIcon = chip.querySelector('.chip-close-icon');
        if (favicon) favicon.style.opacity = '0';
        if (closeIcon) closeIcon.style.opacity = '1';
      });
      
      chip.addEventListener('mouseleave', () => {
        const favicon = chip.querySelector('.chip-favicon');
        const closeIcon = chip.querySelector('.chip-close-icon');
        if (favicon) favicon.style.opacity = '1';
        if (closeIcon) closeIcon.style.opacity = '0';
      });
      
      // Remove button hover
      const removeBtn = chip.querySelector('.remove-chip');
      if (removeBtn) {
        removeBtn.addEventListener('mouseenter', () => {
          removeBtn.style.color = 'rgba(255, 255, 255, 0.8)';
        });
        removeBtn.addEventListener('mouseleave', () => {
          removeBtn.style.color = 'rgba(255, 255, 255, 0.3)';
        });
        
        // Remove button click
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('❌ [Overlay] Remove button clicked for tab:', tab.id);
          
          // Remove from selectedTabs array
          selectedTabs = selectedTabs.filter(t => t.id !== tab.id);
          console.log('📋 [Overlay] Updated selectedTabs:', selectedTabs.map(t => t.id));
          
          // Remove from DOM
          wrapper.remove();
          
          // Sync and re-render
          syncContextToContentScript();
          renderTabList(availableTabs);
        });
      }
      
      pillContainer.appendChild(chip);
      wrapper.appendChild(pillContainer);
      contextPills.appendChild(wrapper);
      
      console.log('✅ [Overlay] Chip added to DOM');
    }
    
    // Select a tab (multiple selection mode)
    function selectTab(tab) {
      console.log('🎯 [Overlay] ===== SELECT TAB =====');
      console.log('🎯 [Overlay] Tab:', { id: tab.id, title: tab.title });
      console.log('🎯 [Overlay] Current selectedTabs:', selectedTabs.map(t => ({ id: t.id, title: t.title })));
      
      // Check if already selected
      if (selectedTabs.find(t => t.id === tab.id)) {
        console.log('⚠️ [Overlay] Tab already selected, deselecting');
        deselectTab(tab.id);
        return;
      }
      
      // Add new selection (allow multiple tabs)
      console.log('➕ [Overlay] Adding new selection');
      selectedTabs.push(tab);
      addContextChip(tab);
      
      console.log('✅ [Overlay] Selection complete. selectedTabs:', selectedTabs.map(t => ({ id: t.id, title: t.title })));
      
      // Sync and re-render
      syncContextToContentScript();
      renderTabList(availableTabs);
    }
    
    // Deselect a tab
    function deselectTab(tabId) {
      console.log('❌ [Overlay] Deselecting tab:', tabId);
      
      // Remove from array
      selectedTabs = selectedTabs.filter(t => t.id !== tabId);
      
      // Remove from DOM
      removeContextChip(tabId);
      
      // Sync and re-render
      syncContextToContentScript();
      renderTabList(availableTabs);
      
      console.log('✅ [Overlay] Deselection complete');
    }
    
    function syncContextToContentScript() {
      window.postMessage({
        type: 'SPEEDY_CONTEXT_CHANGED',
        selectedTabs: selectedTabs
      }, '*');
    }
    
    // Add screenshot chip to context pills
    function addScreenshotChip(screenshot) {
      // Create wrapper div
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        display: inline-flex;
        gap: 3px;
        align-items: center;
      `;
      
      // Create pill container
      const pillContainer = document.createElement('div');
      pillContainer.tabIndex = 0;
      pillContainer.dataset.screenshotId = screenshot.id;
      pillContainer.style.cssText = `
        display: inline-flex;
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        flex-shrink: 0;
        position: relative;
        outline: none;
        visibility: visible;
      `;
      
      // Create the actual pill
      const chip = document.createElement('div');
      chip.className = 'screenshot-chip';
      chip.style.cssText = `
        transition-property: opacity;
        transition-duration: 0.2s;
        transition-timing-function: ease;
        position: relative;
           cursor: pointer;
        border-style: dashed;
        border-width: 1px;
        border-color: rgba(228, 228, 228, 0.124);
        opacity: 1;
           display: flex;
           align-items: center;
        gap: 3px;
        padding: 0 7px;
        border-radius: 5px;
        background: transparent;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 11px;
        line-height: 22px;
        color: rgba(228, 228, 228, 0.55);
        user-select: none;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: visible;
        box-sizing: border-box;
        height: 22px;
        min-height: 22px;
        max-height: 22px;
      `;
      
      chip.innerHTML = `
        <div style="width: 18px; margin-left: -3px; margin-right: -2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative;">
          <span class="chip-favicon" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transition: opacity 150ms; opacity: 1;">
            <img src="${screenshot.thumbnail}" style="width: 15px; height: 15px; border-radius: 2px; object-fit: cover;" />
          </span>
          <span class="chip-close-icon" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transition: opacity 75ms; opacity: 0;">
            <button class="remove-chip" style="
              padding: 0;
              margin: 0;
              background: none;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 14px;
              height: 14px;
              color: rgba(255, 255, 255, 0.3);
              transition: color 75ms;
              line-height: 0;
            " title="Remove screenshot">
              <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor" style="display: block;">
                <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"/>
              </svg>
            </button>
          </span>
        </div>
        <div style="flex-shrink: 0; opacity: 1; color: rgba(255, 255, 255, 0.9); font-size: 11px; line-height: 22px;">Screenshot</div>
      `;
      
      // Hover effect: fade thumbnail out, fade close button in
      chip.addEventListener('mouseenter', () => {
        const favicon = chip.querySelector('.chip-favicon');
        const closeIcon = chip.querySelector('.chip-close-icon');
        if (favicon) favicon.style.opacity = '0';
        if (closeIcon) closeIcon.style.opacity = '1';
      });
      
      chip.addEventListener('mouseleave', () => {
        const favicon = chip.querySelector('.chip-favicon');
        const closeIcon = chip.querySelector('.chip-close-icon');
        if (favicon) favicon.style.opacity = '1';
        if (closeIcon) closeIcon.style.opacity = '0';
      });
      
      // Close button hover effect
      const removeBtn = chip.querySelector('.remove-chip');
      if (removeBtn) {
        removeBtn.addEventListener('mouseenter', () => {
          removeBtn.style.color = 'rgba(255, 255, 255, 0.8)';
        });
        removeBtn.addEventListener('mouseleave', () => {
          removeBtn.style.color = 'rgba(255, 255, 255, 0.3)';
        });
      }
      
      // Click to preview screenshot
      chip.addEventListener('click', (e) => {
        if (!e.target.closest('.remove-chip')) {
          showScreenshotPreview(screenshot);
        }
      });
      
      // Remove chip handler
      chip.querySelector('.remove-chip').addEventListener('click', (e) => {
        e.stopPropagation();
        capturedScreenshots = capturedScreenshots.filter(s => s.id !== screenshot.id);
        wrapper.remove();
      });
      
      pillContainer.appendChild(chip);
      wrapper.appendChild(pillContainer);
      contextPills.appendChild(wrapper);
    }
    
    // Show screenshot preview overlay
    function showScreenshotPreview(screenshot) {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 1000000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        cursor: pointer;
      `;
      
      // Create image
      const img = document.createElement('img');
      img.src = screenshot.dataUrl;
      img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      `;
      
      // Close on click
      overlay.addEventListener('click', () => {
        overlay.remove();
      });
      
      overlay.appendChild(img);
      shadowRoot.appendChild(overlay);
    }
    
    // Track highlighted tab for keyboard navigation
    let highlightedTabIndex = -1;
    
    function renderTabList(tabs) {
      console.log('📋 [Overlay] ===== renderTabList called =====');
      console.log('📋 [Overlay] Total tabs:', tabs.length);
      
      availableTabs = tabs;
      tabList.innerHTML = '';
      highlightedTabIndex = -1;
      
      // Filter tabs based on search query
      const filteredTabs = tabSearchQuery 
        ? tabs.filter(tab => {
            const searchLower = tabSearchQuery.toLowerCase();
            const titleMatch = (tab.title || '').toLowerCase().includes(searchLower);
            const urlMatch = (tab.url || '').toLowerCase().includes(searchLower);
            return titleMatch || urlMatch;
          })
        : tabs;
      
      if (filteredTabs.length === 0) {
        tabList.innerHTML = '<div style="padding: 20px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 13px;">No tabs found</div>';
        return;
      }
      
      filteredTabs.forEach((tab, index) => {
        const isSelected = selectedTabs.find(t => t.id === tab.id);
        
        // Create button with tighter spacing
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tab-menu-item';
        button.dataset.tabIndex = index;
        button.dataset.tabId = tab.id;
        button.style.cssText = `
          display: flex;
          width: 100%;
          text-align: left;
          padding: 6px 8px;
          font-size: 13px;
          align-items: center;
          overflow: hidden;
          transition: background 150ms ease;
          border-radius: 6px;
          border: none;
          background: ${isSelected ? 'rgba(96, 165, 250, 0.15)' : 'transparent'};
          cursor: pointer;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0;
        `;
        
        const title = tab.title || 'Untitled';
        const displayTitle = title.length > 40 ? title.substring(0, 40) + '...' : title;
        
        // Favicon
        const faviconUrl = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>';
        
        button.innerHTML = `
          <span style="margin-right: 8px; flex-shrink: 0; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
            <img alt="${title}" width="16" height="16" src="${faviconUrl}" style="object-fit: contain; border-radius: 2px;" />
          </span>
          <span style="flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: rgba(255, 255, 255, 0.95); font-weight: 500;">
            ${displayTitle}
          </span>
          ${isSelected ? '<span style="margin-left: 8px; flex-shrink: 0; color: rgba(96, 165, 250, 0.8); font-size: 14px;">✓</span>' : ''}
        `;
        
        // Hover effects
        button.addEventListener('mouseenter', () => {
          highlightedTabIndex = index;
          updateTabHighlight();
        });
        
        // Click handler - select and auto-close
        button.addEventListener('click', () => {
          selectTab(tab);
          closeTabMenu();
        });
        
        tabList.appendChild(button);
      });
    }
    
    function updateTabHighlight() {
      const buttons = tabList.querySelectorAll('.tab-menu-item');
      buttons.forEach((btn, idx) => {
        const isSelected = selectedTabs.find(t => t.id == btn.dataset.tabId);
        if (idx === highlightedTabIndex) {
          btn.style.background = 'rgba(96, 165, 250, 0.25)';
        } else if (isSelected) {
          btn.style.background = 'rgba(96, 165, 250, 0.15)';
        } else {
          btn.style.background = 'transparent';
        }
      });
    }
    
    function closeTabMenu() {
      tabMenu.style.display = 'none';
      atButton.style.background = 'transparent';
      tabSearchQuery = '';
      highlightedTabIndex = -1;
    }
    
    // Model Selector handler
    modelSelector.addEventListener('click', (e) => {
      console.log('🔧 [Overlay] Model selector clicked');
      e.preventDefault();
      // Don't stop propagation - let it bubble so the shadow root handler can check it
      
      const isOpen = modelMenu.style.display === 'block';
      console.log('🔧 [Overlay] Model menu current state:', isOpen ? 'open' : 'closed');
      
      if (!isOpen) {
        console.log('🔧 [Overlay] Opening model menu');
        openModelMenu();
        tabMenu.style.display = 'none';
      } else {
        console.log('🔧 [Overlay] Closing model menu');
        closeModelMenu();
      }
    });
    
    
    // @ Button handler
    atButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      closeModelMenu();
      
      if (tabMenu.style.display === 'none' || !tabMenu.style.display) {
        tabSearchQuery = '';
        loadAvailableTabs();
        tabMenu.style.display = 'block';
        atButton.style.background = 'rgba(255, 255, 255, 0.1)';
        highlightedTabIndex = 0; // Start with first tab highlighted
        // Highlight first tab after a short delay to ensure tabs are rendered
        setTimeout(() => updateTabHighlight(), 50);
      } else {
        closeTabMenu();
      }
    });
    
    // Keyboard navigation for tab menu
    document.addEventListener('keydown', (e) => {
      // Only handle if tab menu is open
      if (tabMenu.style.display !== 'block') return;
      
      const buttons = tabList.querySelectorAll('.tab-menu-item');
      if (buttons.length === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedTabIndex = Math.min(highlightedTabIndex + 1, buttons.length - 1);
        updateTabHighlight();
        // Scroll highlighted item into view
        buttons[highlightedTabIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedTabIndex = Math.max(highlightedTabIndex - 1, 0);
        updateTabHighlight();
        // Scroll highlighted item into view
        buttons[highlightedTabIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedTabIndex >= 0 && highlightedTabIndex < availableTabs.length) {
          const filteredTabs = tabSearchQuery 
            ? availableTabs.filter(tab => {
                const searchLower = tabSearchQuery.toLowerCase();
                return (tab.title || '').toLowerCase().includes(searchLower) || 
                       (tab.url || '').toLowerCase().includes(searchLower);
              })
            : availableTabs;
          const selectedTab = filteredTabs[highlightedTabIndex];
          if (selectedTab) {
            selectTab(selectedTab);
            closeTabMenu();
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeTabMenu();
      }
    });
    
    // Input handlers
    input.addEventListener('input', (e) => {
      updatePlaceholder();
      message = input.textContent;
      button.disabled = !message.trim();
      
      if (message.trim()) {
        button.style.color = 'rgba(255, 255, 255, 1)';
      } else {
        button.style.color = 'rgba(255, 255, 255, 0.5)';
      }
      
      // Handle @ search filtering
      if (tabMenu.style.display === 'block') {
        const text = input.textContent;
        const atIndex = text.lastIndexOf('@');
        
        if (atIndex !== -1) {
          // Extract search query after @
          tabSearchQuery = text.substring(atIndex + 1).trim();
          renderTabList(availableTabs);
        }
      }
    });
    
    input.addEventListener('keydown', (e) => {
      // Handle arrow keys for tab menu navigation BEFORE stopping propagation
      if (tabMenu.style.display === 'block') {
        const buttons = tabList.querySelectorAll('.tab-menu-item');
        
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          if (buttons.length > 0) {
            highlightedTabIndex = Math.min(highlightedTabIndex + 1, buttons.length - 1);
            updateTabHighlight();
            buttons[highlightedTabIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          if (buttons.length > 0) {
            highlightedTabIndex = Math.max(highlightedTabIndex - 1, 0);
            updateTabHighlight();
            buttons[highlightedTabIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
          return;
        } else if (e.key === 'Enter' && highlightedTabIndex >= 0) {
          e.preventDefault();
          e.stopPropagation();
          const filteredTabs = tabSearchQuery 
            ? availableTabs.filter(tab => {
                const searchLower = tabSearchQuery.toLowerCase();
                return (tab.title || '').toLowerCase().includes(searchLower) || 
                       (tab.url || '').toLowerCase().includes(searchLower);
              })
            : availableTabs;
          if (highlightedTabIndex < filteredTabs.length) {
            const selectedTab = filteredTabs[highlightedTabIndex];
            if (selectedTab) {
              selectTab(selectedTab);
              closeTabMenu();
            }
          }
          return;
        }
      }
      
      e.stopPropagation();
      
      if (e.key === 'Escape' && isVisible) {
        e.preventDefault();
        toggleOverlay();
        return;
      }
      
      // Enter to submit, Shift+Enter for new line
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (message.trim() && !isStreaming) {
          form.dispatchEvent(new Event('submit'));
        }
        return;
      }
      
      // Handle @ key to open tab menu
      if (e.key === '@') {
        setTimeout(() => {
          tabSearchQuery = '';
          loadAvailableTabs();
          tabMenu.style.display = 'block';
          atButton.style.background = 'rgba(255, 255, 255, 0.1)';
          highlightedTabIndex = 0;
          setTimeout(() => updateTabHighlight(), 50);
        }, 0);
      }
      
      // Close tab menu on Escape
      if (e.key === 'Escape' && tabMenu.style.display === 'block') {
        e.preventDefault();
        tabMenu.style.display = 'none';
        atButton.style.background = 'transparent';
        tabSearchQuery = '';
        return;
      }
    });
    
    input.addEventListener('keypress', (e) => {
      e.stopPropagation();
    });
    
    input.addEventListener('keyup', (e) => {
      e.stopPropagation();
    });
    
    input.addEventListener('focus', () => {
      form.style.boxShadow = '0 0 0 1px rgba(96, 165, 250, 0.5), 0 10px 40px rgba(0, 0, 0, 0.25)';
      form.style.borderColor = 'rgba(96, 165, 250, 0.6)';
      closeModelMenu();
    });
    
    // Hover effect for chat history button
    sidebarToggle.addEventListener('mouseenter', () => {
      sidebarToggle.style.color = 'rgba(255, 255, 255, 1)';
      sidebarToggle.style.background = 'rgba(255, 255, 255, 0.08)';
    });
    
    sidebarToggle.addEventListener('mouseleave', () => {
      sidebarToggle.style.color = 'rgba(255, 255, 255, 0.6)';
      sidebarToggle.style.background = 'transparent';
    });
    
    input.addEventListener('blur', () => {
      form.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)';
      form.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    });
    
    // Screenshot capture handler with region selection
    screenshotBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        // Send message to content script, which will forward to background
        window.postMessage({
          type: 'SPEEDY_CAPTURE_SCREENSHOT'
        }, '*');
      } catch (error) {
        console.error('Screenshot failed:', error);
        showNotification('Screenshot capture failed');
      }
    });
    
    // Listen for screenshot captured message from content script
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      
      if (event.data.type === 'SPEEDY_SCREENSHOT_CAPTURED') {
        // Add screenshot to captured list
        const screenshot = {
          id: `screenshot-${Date.now()}`,
          dataUrl: event.data.dataUrl,
          timestamp: new Date().toISOString(),
          thumbnail: event.data.dataUrl
        };

        capturedScreenshots.push(screenshot);
        
        // Add screenshot chip to context
        addScreenshotChip(screenshot);
        
        // Show notification
        showNotification('Screenshot captured!');
      }
    });
    
    // Show notification function
    function showNotification(text, duration = 2000) {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        z-index: 999998;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      `;
      notification.textContent = text;
      
      shadowRoot.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '1';
      }, 10);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          notification.remove();
        }, 200);
      }, duration);
    }
    
    // Form submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      
      if (!message.trim() || isStreaming) {
        return;
      }
      
      // Trigger send animation
      animateSend();
      
      const messageToSend = message.trim();
      
      // Build context from tabs - fetch actual content via background script
      const contextsToSend = [];
      
      // Fetch content for each selected tab
      for (const tab of selectedTabs) {
        try {
          // Request tab content extraction from background script
          const contentResponse = new Promise((resolve, reject) => {
            const requestId = `extract_${Date.now()}_${Math.random()}`;
            
            // Listen for response
            const messageHandler = (event) => {
              if (event.source !== window) return;
              if (event.data.type === 'SPEEDY_EXTRACT_RESPONSE' && event.data.requestId === requestId) {
                window.removeEventListener('message', messageHandler);
                
                if (event.data.success) {
                  resolve(event.data.content);
                } else {
                  reject(new Error(event.data.error || 'Content extraction failed'));
                }
              }
            };
            
            window.addEventListener('message', messageHandler);
            
            // Send request to content script
            window.postMessage({
              type: 'SPEEDY_EXTRACT_TAB_CONTENT',
              requestId,
              tabId: tab.id
            }, '*');
            
            // Timeout after 5 seconds
            setTimeout(() => {
              window.removeEventListener('message', messageHandler);
              reject(new Error('Content extraction timeout'));
            }, 5000);
          });
          
          const content = await contentResponse;
          
          contextsToSend.push({
            type: 'tab',
            data: {
              id: tab.id,
              title: tab.title,
              url: tab.url,
              content: content || '',
              favIconUrl: tab.favIconUrl
            }
          });
        } catch (error) {
          console.warn('Failed to fetch tab content for', tab.title, '- continuing without content:', error.message);
          // Add tab without content if fetch fails
          contextsToSend.push({
            type: 'tab',
            data: {
              id: tab.id,
              title: tab.title,
              url: tab.url,
              content: '',
              favIconUrl: tab.favIconUrl
            }
          });
        }
      }
      
      // Add screenshots to context
      capturedScreenshots.forEach(screenshot => {
        contextsToSend.push({
          type: 'image',
          data: {
            id: screenshot.id,
            dataUrl: screenshot.dataUrl,
            timestamp: screenshot.timestamp
          }
        });
      });
      
      message = '';
      input.textContent = '';
      button.disabled = true;
      button.style.color = 'rgba(255, 255, 255, 0.5)';
      updatePlaceholder();
      
      // Keep selectedTabs and context pills - only clear screenshots
      capturedScreenshots = [];
      shadowRoot.querySelectorAll('.screenshot-chip').forEach(chip => chip.remove());
      
      try {
        await sendMessageToAPI(messageToSend, contextsToSend);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    
    
    // Close menus when clicking outside (use capture phase to handle before other handlers)
    shadowRoot.addEventListener('click', (e) => {
      console.log('🔧 [Overlay] Shadow root click detected', {
        target: e.target,
        isInOverlay: overlay.contains(e.target),
        isModelSelector: modelSelector.contains(e.target),
        isModelMenu: modelMenu.contains(e.target),
        isAtButton: atButton.contains(e.target),
        isTabMenu: tabMenu.contains(e.target)
      });
      
      // Don't close if clicking on model selector, model menu, @ button, or tab menu
      if (modelSelector.contains(e.target) || modelMenu.contains(e.target) || 
          atButton.contains(e.target) || tabMenu.contains(e.target)) {
        console.log('🔧 [Overlay] Click is on interactive element, not closing');
        return;
      }
      
      if (!overlay.contains(e.target)) {
        console.log('🔧 [Overlay] Click outside overlay, closing menus');
        closeModelMenu();
        tabMenu.style.display = 'none';
        atButton.style.background = 'transparent';
      }
    }, true); // Use capture phase
    
    // Listen for messages from content script
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      
      if (event.data.type === 'SPEEDY_TOGGLE_OVERLAY') {
        console.log('🎯 [Overlay] Received toggle command, current visibility:', isVisible);
        toggleOverlay();
      }
      
      if (event.data.type === 'SPEEDY_TABS_RESPONSE') {
        console.log('✅ [Overlay] Received SPEEDY_TABS_RESPONSE:', event.data);
        const tabs = event.data.tabs || [];
        console.log('📋 [Overlay] Tabs count:', tabs.length);
        console.log('📋 [Overlay] Currently selected tabs:', selectedTabs.length);
        
        // Automatically add the current tab if no tabs are selected
        const currentTab = tabs.find(tab => tab.active);
        if (currentTab) {
          const alreadySelected = selectedTabs.find(t => t.id === currentTab.id);
          if (!alreadySelected && selectedTabs.length === 0) {
            console.log('🔍 [Overlay] Auto-selecting current tab:', currentTab.title);
            selectedTabs.push(currentTab);
            addContextChip(currentTab);
          } else if (alreadySelected) {
            console.log('ℹ️ [Overlay] Current tab already selected');
          } else {
            console.log('ℹ️ [Overlay] Other tabs already selected, not auto-selecting current tab');
          }
        } else {
          console.log('⚠️ [Overlay] No current tab found in tabs list');
        }
        
        renderTabList(tabs);
      }
    });
    
    // ========== SIDEBAR EVENT LISTENERS ==========
    
    // Sidebar toggle button
    sidebarToggle.addEventListener('click', () => {
      toggleSidebar();
      if (chatSidebar.classList.contains('open')) {
        loadChats();
      }
    });
    
    // Sidebar close button
    sidebarClose.addEventListener('click', closeSidebar);
    
    // New chat button
    newChatBtn.addEventListener('click', createNewChat);
    
    // Search input with debounce
    chatSearch.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        loadChats(e.target.value);
      }, 300);
    });
    
    // Show sidebar toggle when overlay is visible
    const originalToggleOverlay = toggleOverlay;
    toggleOverlay = function() {
      originalToggleOverlay();
      if (isVisible) {
        sidebarToggle.style.display = 'flex';
        // Track overlay opened
        analytics.trackEvent('overlay_opened');
      } else {
        sidebarToggle.style.display = 'none';
        closeSidebar();
        // Track overlay closed
        analytics.trackEvent('overlay_closed');
      }
    };
    
    // Initialize models
    fetchModels();
    
    // Load initial chats
    loadChats();
    
    console.log('✅ Speedy AI Overlay initialized');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOverlay);
  } else {
    setTimeout(initOverlay, 0);
  }
})();
