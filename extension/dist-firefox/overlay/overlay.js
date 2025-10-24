(function(){const Q={trackEvent:(L,l)=>{try{window.posthog&&window.posthog.capture(L,l)}catch(y){console.log("Analytics not available:",y)}}};async function b(L,l,y=null){return new Promise((h,m)=>{const u=`api_${Date.now()}_${Math.random()}`,k=v=>{v.source===window&&v.data.type==="SPEEDY_API_RESPONSE"&&v.data.requestId===u&&(window.removeEventListener("message",k),v.data.success?h(v.data.data):m(new Error(v.data.error||"API request failed")))};window.addEventListener("message",k),window.postMessage({type:"SPEEDY_API_REQUEST",requestId:u,method:L,endpoint:l,body:y},"*"),setTimeout(()=>{window.removeEventListener("message",k),m(new Error("API request timeout"))},3e4)})}function Me(){return`
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
                gap: 2px;
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
    `}function pe(){const L=document.getElementById("speedy-ai-overlay-root");if(!L){console.error("Speedy AI: Overlay container not found");return}let l=L.shadowRoot;if(l)console.log("♻️ [Overlay] Shadow DOM already exists, reusing it"),l.innerHTML="";else try{l=L.attachShadow({mode:"open"})}catch(e){console.error("❌ [Overlay] Failed to attach shadow DOM:",e),L.remove();return}l.innerHTML=Me();const y=l.getElementById("speedy-floating-overlay"),h=l.getElementById("speedy-fab"),m=l.getElementById("speedy-input"),u=l.getElementById("speedy-submit"),k=l.getElementById("speedy-send-icon"),v=l.getElementById("speedy-form"),M=l.getElementById("speedy-at-button"),P=l.getElementById("speedy-paperclip-icon"),D=l.getElementById("speedy-crop-icon"),w=l.getElementById("speedy-tab-menu"),ee=l.getElementById("speedy-tab-list"),R=l.getElementById("speedy-context-pills"),U=l.getElementById("speedy-model-selector"),T=l.getElementById("speedy-model-menu"),ge=l.getElementById("speedy-model-name"),ye=l.getElementById("speedy-model-chevron"),te=l.getElementById("all-models"),O=l.getElementById("speedy-messages-list"),C=l.getElementById("speedy-image-upload"),S=l.getElementById("speedy-screenshot-capture"),I=l.getElementById("speedy-sidebar-toggle-top"),ne=l.getElementById("speedy-chat-sidebar"),Te=l.getElementById("speedy-sidebar-close"),Oe=l.getElementById("speedy-new-chat-btn"),Ie=l.getElementById("speedy-chat-search"),G=l.getElementById("speedy-chat-list");let B="",f=!1,W=!0,x=[];function ze(){console.log("🔍 [Overlay] Requesting overlay state from content script"),console.log("🔍 [Overlay] Current isVisible:",f),window.postMessage({type:"SPEEDY_GET_OVERLAY_STATE"},"*")}function Be(e){console.log("💾 [Overlay] Saving overlay state:",e),console.log("💾 [Overlay] Current isVisible:",f),window.postMessage({type:"SPEEDY_SAVE_OVERLAY_STATE",isVisible:e},"*")}window.addEventListener("message",e=>{if(e.source===window){if(e.data.type==="SPEEDY_OVERLAY_STATE_RESPONSE"){console.log("📨 [Overlay] Received overlay state response:",e.data.state),console.log("📨 [Overlay] Current isVisible:",f);const t=e.data.state;t&&t.isVisible&&!f?(console.log("✅ [Overlay] State says visible=true, opening overlay"),setTimeout(()=>{$()},100)):console.log("⏭️ [Overlay] No action needed. State visible:",t==null?void 0:t.isVisible,"Current visible:",f)}if(e.data.type==="SPEEDY_OVERLAY_STATE_CHANGED"){console.log("🔄 [Overlay] Received state change from another tab:",e.data.state),console.log("🔄 [Overlay] Current isVisible:",f);const t=e.data.state;t&&t.isVisible!==f?(console.log("✅ [Overlay] State mismatch! Syncing... New state:",t.isVisible),$()):console.log("⏭️ [Overlay] States match, no sync needed")}}}),console.log("🚀 [Overlay] Initializing overlay state sync"),ze();let N=[],_="anthropic/claude-3.5-sonnet",Y=[],me=!0,E=null,oe=[],J=!1,j=[],Z=[],ue=null,z="";const _e=["openai/gpt-4o","openai/gpt-4o-mini","openai/gpt-4-turbo","anthropic/claude-3.5-sonnet","anthropic/claude-3-opus","anthropic/claude-3-haiku","google/gemini-pro-1.5","google/gemini-flash-1.5","x-ai/grok-beta"];function se(){if(m.getAttribute("data-placeholder"),m.textContent.trim()===""&&(m.innerHTML=""),m.textContent.trim()===""&&(m.style.setProperty("--placeholder-visible","block"),!m.hasAttribute("data-placeholder-added"))){const e=document.createElement("style");e.textContent=`
            #speedy-input:empty:before {
              content: attr(data-placeholder);
              color: rgba(255, 255, 255, 0.5);
              opacity: 0.5;
              pointer-events: none;
              position: absolute;
            }
          `,l.appendChild(e),m.setAttribute("data-placeholder-added","true")}}function he(){try{return location.hostname||"default"}catch{return"default"}}function Ae(){const e=`speedy_overlay_size_${he()}`,t=localStorage.getItem(e);if(!t)return null;try{return JSON.parse(t)}catch{return null}}function $e(e,t){const n=`speedy_overlay_size_${he()}`,o=JSON.stringify({width:e,height:t});localStorage.setItem(n,o)}se();let K=!1,ie="",d={x:0,y:0,width:0,height:0,left:0,top:0};function Pe(e,t){e.preventDefault(),e.stopPropagation(),K=!0,ie=t;const n=y.getBoundingClientRect();d.x=e.clientX,d.y=e.clientY,d.width=n.width,d.height=n.height,d.left=n.left,d.top=n.top,dragOffset.x=e.clientX-n.left,dragOffset.y=e.clientY-n.top,y.style.transition="none",document.body.style.cursor=e.target.style.cursor,document.addEventListener("mousemove",fe),document.addEventListener("mouseup",xe)}function fe(e){if(!K)return;const t=e.clientX-d.x,n=e.clientY-d.y;let o=d.width,s=d.height,i=d.left,r=d.top;const a=350,p=250,c=window.innerWidth-20,g=window.innerHeight-20;switch(ie){case"se":o=Math.max(a,Math.min(c,d.width+t)),s=Math.max(p,Math.min(g,d.height+n));break;case"sw":o=Math.max(a,Math.min(c,d.width-t)),s=Math.max(p,Math.min(g,d.height+n)),i=d.left+(d.width-o);break;case"ne":o=Math.max(a,Math.min(c,d.width+t)),s=Math.max(p,Math.min(g,d.height-n)),r=d.top+(d.height-s);break;case"nw":o=Math.max(a,Math.min(c,d.width-t)),s=Math.max(p,Math.min(g,d.height-n)),i=d.left+(d.width-o),r=d.top+(d.height-s);break;case"n":s=Math.max(p,Math.min(g,d.height-n)),r=d.top+(d.height-s);break;case"s":s=Math.max(p,Math.min(g,d.height+n));break;case"e":o=Math.max(a,Math.min(c,d.width+t));break;case"w":o=Math.max(a,Math.min(c,d.width-t)),i=d.left+(d.width-o);break}y.style.width=`${o}px`,y.style.maxHeight=`${s}px`,v.style.maxHeight=`${s}px`,(i!==d.left||r!==d.top)&&(y.style.left=`${i}px`,y.style.top=`${r}px`)}function xe(){if(!K)return;K=!1,ie="",y.style.transition="",document.body.style.cursor="",document.removeEventListener("mousemove",fe),document.removeEventListener("mouseup",xe);const e=y.getBoundingClientRect();$e(e.width,e.height)}l.querySelectorAll(".resize-handle").forEach(e=>{const t=e.classList[1].replace("resize-","");e.addEventListener("mousedown",n=>Pe(n,t))}),h.addEventListener("click",()=>{W&&$()}),h.addEventListener("mouseenter",()=>{h.style.transform="translateX(-50%) scale(1.1)",h.style.boxShadow="0 6px 20px rgba(0, 0, 0, 0.3)"}),h.addEventListener("mouseleave",()=>{h.style.transform="translateX(-50%) scale(1)",h.style.boxShadow="0 4px 16px rgba(0, 0, 0, 0.2)"}),setTimeout(()=>{h.style.opacity="1",h.style.transform="translateX(-50%) scale(1)",h.style.pointerEvents="auto"},500),u.addEventListener("mouseenter",()=>{u.disabled||(u.style.transform="scale(1.1)",u.style.color="rgba(255, 255, 255, 0.9)",k.style.transform="translateX(2px) translateY(-2px) rotate(-5deg)")}),u.addEventListener("mouseleave",()=>{u.disabled||(u.style.transform="scale(1)",u.style.color="rgba(255, 255, 255, 0.5)",k.style.transform="translateX(0) translateY(0) rotate(0deg)")}),u.addEventListener("mousedown",()=>{u.disabled||(u.style.transform="scale(0.95)")}),u.addEventListener("mouseup",()=>{u.disabled||(u.style.transform="scale(1.1)")});function De(){k.style.transform="translateX(20px) translateY(-20px) rotate(45deg)",k.style.opacity="0",setTimeout(()=>{k.style.transition="none",k.style.transform="translateX(0) translateY(0) rotate(0deg)",k.style.opacity="1",setTimeout(()=>{k.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"},50)},300)}C.addEventListener("mouseenter",()=>{C.style.transform="scale(1.15)",C.style.color="rgba(255, 255, 255, 1)",P.style.transform="rotate(-15deg) translateY(-1px)",setTimeout(()=>{P.style.transform="rotate(15deg) translateY(-1px)"},100),setTimeout(()=>{P.style.transform="rotate(-10deg) translateY(-1px)"},200)}),C.addEventListener("mouseleave",()=>{C.style.transform="scale(1)",C.style.color="rgba(255, 255, 255, 0.9)",P.style.transform="rotate(0deg) translateY(0)"}),C.addEventListener("mousedown",()=>{C.style.transform="scale(0.9)",P.style.transform="rotate(-25deg)"}),C.addEventListener("mouseup",()=>{C.style.transform="scale(1.15)",P.style.transform="rotate(-10deg) translateY(-1px)"}),S.addEventListener("mouseenter",()=>{S.style.transform="scale(1.15)",S.style.color="rgba(255, 255, 255, 1)",D.style.transform="scale(1.2)",setTimeout(()=>{D.style.transform="scale(0.9)"},100),setTimeout(()=>{D.style.transform="scale(1.15)"},200)}),S.addEventListener("mouseleave",()=>{S.style.transform="scale(1)",S.style.color="rgba(255, 255, 255, 0.9)",D.style.transform="scale(1)"}),S.addEventListener("mousedown",()=>{S.style.transform="scale(0.85)",D.style.transform="scale(0.7)"}),S.addEventListener("mouseup",()=>{S.style.transform="scale(1.15)",D.style.transform="scale(1.15)"});async function He(){try{const e=await b("GET","/api/openrouter/models");if(e.data&&Array.isArray(e.data)){const t=["openai/gpt-4o","openai/gpt-4o-mini","openai/gpt-4-turbo","openai/chatgpt-4o-latest","openai/o1","openai/o1-mini","anthropic/claude-3.5-sonnet","anthropic/claude-3-opus","anthropic/claude-opus-4-20250514","google/gemini-pro-1.5","google/gemini-flash-1.5","google/gemini-2.0-flash-exp","x-ai/grok-beta","x-ai/grok-2-1212","x-ai/grok-2"];Y=e.data.filter(o=>t.includes(o.id)).sort((o,s)=>{const i=o.id.split("/")[0],r=s.id.split("/")[0];if(i!==r){const c=["openai","anthropic","google","x-ai"];return c.indexOf(i)-c.indexOf(r)}const a=(o.name||o.id).toLowerCase(),p=(s.name||s.id).toLowerCase();return a.localeCompare(p)})}}catch(e){console.error("Error fetching models:",e),Y=_e.map(t=>({id:t,name:t.split("/").pop()}))}finally{me=!1,ae(),be()}}function Re(e){const t=Y.find(s=>s.id===e);if(t!=null&&t.name){const s=t.name.toLowerCase();return s.includes("sonnet")?"sonnet":s.includes("opus")?"opus":s.includes("gpt-4o")?"gpt-4o":s.includes("gpt-4")?"gpt-4":s.includes("chatgpt")?"chatgpt":s.includes("o1")?"o1":s.includes("gemini")?s.includes("flash")?"gemini-flash":s.includes("pro")?"gemini-pro":"gemini":s.includes("grok")?"grok":t.name}const n=e.split("/"),o=n[n.length-1];return o.includes("sonnet")?"sonnet":o.includes("opus")?"opus":o.includes("gpt-4o")?"gpt-4o":o.includes("gpt-4")?"gpt-4":o.includes("chatgpt")?"chatgpt":o.includes("o1")?"o1":o.includes("gemini")?"gemini":o.includes("grok")?"grok":o.split("-")[0]}function ae(){me?ge.textContent="Loading...":ge.textContent=Re(_)}function be(){te.innerHTML="",Y.forEach(e=>{const t=Ue(e);te.appendChild(t)})}function Ue(e){const t=document.createElement("button");t.type="button";const n=_===e.id,[o,...s]=e.id.split("/"),i=s.join("/");let r=e.name||i;const p={openai:"OpenAI",anthropic:"Anthropic",google:"Google","x-ai":"xAI"}[o]||o;let c=r;r.toLowerCase().includes("claude")?c=r.replace(/claude-/i,"Claude ").replace(/-/g," "):r.toLowerCase().includes("gpt")?c=r.replace(/gpt-/i,"GPT-").replace(/-/g," "):r.toLowerCase().includes("gemini")?c=r.replace(/gemini-/i,"Gemini ").replace(/-/g," "):r.toLowerCase().includes("grok")&&(c=r.replace(/grok-/i,"Grok ").replace(/-/g," ")),t.style.cssText=`
        width: 100%;
        text-align: left;
        padding: 8px 10px;
        font-size: 13px;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        border-radius: 8px;
        border: none;
        background: ${n?"rgba(59, 130, 246, 0.1)":"transparent"};
        color: ${n?"rgb(37, 99, 235)":"rgb(55, 65, 81)"};
        cursor: pointer;
        transition: background 0.1s;
        font-weight: ${n?"600":"500"};
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: auto;
      `;const g=document.createElement("span");g.style.cssText=`
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.05);
        color: rgba(0, 0, 0, 0.6);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      `,g.textContent=p;const X=document.createElement("span");return X.textContent=c,X.style.flex="1",t.appendChild(g),t.appendChild(X),t.addEventListener("mouseenter",()=>{n||(t.style.background="rgba(243, 244, 246, 1)")}),t.addEventListener("mouseleave",()=>{n||(t.style.background="transparent")}),t.addEventListener("click",()=>{_=e.id,ae(),be(),H()}),t}function H(){T.style.display="none",ye.style.transform="rotate(0deg)",U.style.background="transparent"}function Ne(){console.log("🔧 [Overlay] openModelMenu called",{menuElement:T,menuDisplay:T.style.display,menuChildCount:T.children.length,allModelsChildCount:te.children.length,availableModelsCount:Y.length}),T.style.display="block",ye.style.transform="rotate(180deg)",U.style.background="rgba(255, 255, 255, 0.05)",console.log("🔧 [Overlay] Menu display set to block, computed style:",window.getComputedStyle(T).display)}async function Ye(){if(E)return E;const e=localStorage.getItem("speedy_last_chat_id");if(e)try{if(await b("GET",`/api/chats/${e}`))return E=e,await Ee(e),E}catch{console.log("Saved chat not found, creating new one"),localStorage.removeItem("speedy_last_chat_id")}try{return E=(await b("POST","/api/chats",{title:"New Chat",model:_}))._id,localStorage.setItem("speedy_last_chat_id",E),await A(),E}catch(t){return console.error("Error creating chat:",t),null}}function re(e,t,n=!1){O.style.display="flex";const o=document.createElement("div");o.className=`speedy-message-wrapper ${e}`;const s=document.createElement("div");s.className="speedy-message-content";const i=document.createElement("div");i.className=`speedy-message speedy-message-${e}`,n&&i.classList.add("speedy-message-streaming"),i.innerHTML=ve(t,e);const r=document.createElement("span");r.className="speedy-message-timestamp";const a=new Date;return r.textContent=a.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),s.appendChild(i),s.appendChild(r),o.appendChild(s),O.appendChild(o),le(),i}function ve(e,t){if(!e)return"";if(t==="user")return q(e);let n=q(e);return n=n.replace(/`([^`]+)`/g,"<code>$1</code>"),n=n.replace(/```([^`]+)```/g,"<pre><code>$1</code></pre>"),n=n.replace(/\*\*([^\*]+)\*\*/g,"<strong>$1</strong>"),n}function q(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function je(e,t){const n=e.classList.contains("speedy-message-user")?"user":"assistant";e.innerHTML=ve(t,n),le()}function le(){O.scrollTop=O.scrollHeight}async function qe(e,t=[]){const n=await Ye();if(!n){console.error("Failed to create chat");return}Q.trackEvent("chat_message_sent",{messageLength:e.length,hasContext:t.length>0,contextCount:t.length}),re("user",e),await b("POST",`/api/chats/${n}/message`,{role:"user",content:e,context:t});const s=(await b("GET",`/api/chats/${n}`)).messages.map(a=>({role:a.role,content:Ve(a.content,a.context)}));J=!0;const i=re("assistant","",!0);let r="";try{const a=await b("POST","/api/openrouter/chat",{messages:s,model:_,stream:!1});a.choices&&a.choices[0]&&a.choices[0].message&&(r=a.choices[0].message.content,await Fe(i,r)),await b("POST",`/api/chats/${n}/message`,{role:"assistant",content:r,context:[]}),i.classList.remove("speedy-message-streaming");const p=await b("GET",`/api/chats/${n}`);if(p.messages.length===2&&p.title==="New Chat"){console.log("🏷️ [Overlay] Auto-generating chat title...");try{await b("POST",`/api/chats/${n}/generate-title`),console.log("✅ [Overlay] Chat title generated successfully")}catch(c){console.error("❌ [Overlay] Failed to generate chat title:",c)}}Z.length>0&&await A()}catch(a){console.error("Error streaming response:",a),i.textContent="Error: Failed to get response"}finally{J=!1}}async function Fe(e,t){const n=t.split(" ");let o="";for(let s=0;s<n.length;s++)o+=(s>0?" ":"")+n[s],je(e,o),le(),await new Promise(i=>setTimeout(i,30))}function Ve(e,t=[]){if(!t||t.length===0)return e;let n=`<additional_information>
`;n+=`Below is additional context information:

`;for(const o of t)o.type==="tab"&&(n+=`<content source="webpage" title="${o.data.title}" url="${o.data.url}">
`,n+=`${o.data.content}
</content>

`);return n+=`</additional_information>

`,n+e}async function A(e=""){try{const t=e?`/api/chats?search=${encodeURIComponent(e)}`:"/api/chats",n=await b("GET",t);Z=n.chats||n,we()}catch(t){console.error("Error loading chats:",t),G.innerHTML=`
          <div class="speedy-empty-state">
            <div class="speedy-empty-state-icon">⚠️</div>
            <div>Failed to load chats</div>
          </div>
        `}}function we(){if(Z.length===0){G.innerHTML=`
          <div class="speedy-empty-state">
            <div class="speedy-empty-state-icon">💬</div>
            <div>No chats yet</div>
            <div style="font-size: 12px; margin-top: 8px;">Start a new conversation!</div>
          </div>
        `;return}G.innerHTML="",Z.forEach(e=>{const t=Xe(e);G.appendChild(t)})}function Xe(e){const t=document.createElement("div");t.className="speedy-chat-item",e._id===E&&t.classList.add("active");const n=e.messages&&e.messages.length>0?e.messages[e.messages.length-1].content:"No messages yet",o=e.messages?e.messages.length:0,s=new Date(e.updatedAt),i=Ke(s);return t.innerHTML=`
        <div class="speedy-chat-item-title">${q(e.title)}</div>
        <div class="speedy-chat-item-preview">${q(n.substring(0,60))}${n.length>60?"...":""}</div>
        <div class="speedy-chat-item-meta">
          <span>${o} messages</span>
          <span>${i}</span>
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
      `,t.addEventListener("click",async a=>{a.target.closest(".speedy-chat-action-btn")||await Ge(e._id)}),t.querySelectorAll(".speedy-chat-action-btn").forEach(a=>{a.addEventListener("click",async p=>{p.stopPropagation();const c=a.dataset.action;c==="delete"?await We(e._id):c==="rename"?await Je(e._id,e.title):c==="export"&&await Ze(e._id)})}),t}async function Ge(e){if(e===E){F();return}E=e,localStorage.setItem("speedy_last_chat_id",e),O.innerHTML="",oe=[],await Ee(e),we(),F()}async function Ee(e){try{const t=await b("GET",`/api/chats/${e}`);t.messages&&t.messages.length>0?(O.style.display="flex",t.messages.forEach(n=>{re(n.role,n.content,!1)}),oe=t.messages):O.style.display="none",t.model&&t.model!==_&&(_=t.model,ae())}catch(t){console.error("Error loading chat messages:",t)}}async function ke(){try{E=(await b("POST","/api/chats",{title:"New Chat",model:_}))._id,localStorage.setItem("speedy_last_chat_id",E),O.innerHTML="",O.style.display="none",oe=[],await A(),F()}catch(e){console.error("Error creating new chat:",e)}}async function We(e){const t=Se("Delete Chat","Are you sure you want to delete this chat? This action cannot be undone.",[{text:"Cancel",class:"speedy-modal-btn speedy-modal-btn-secondary",action:"close"},{text:"Delete",class:"speedy-modal-btn speedy-modal-btn-danger",action:"confirm"}]);if(l.appendChild(t),!!await new Promise(o=>{t.querySelectorAll(".speedy-modal-btn").forEach(s=>{s.addEventListener("click",()=>{o(s.textContent==="Delete"),t.remove()})})}))try{await b("DELETE",`/api/chats/${e}`),e===E?await ke():await A()}catch(o){console.error("Error deleting chat:",o)}}async function Je(e,t){const n=Se("Rename Chat",`<input type="text" class="speedy-modal-input" id="rename-input" value="${q(t)}" placeholder="Enter new title">`,[{text:"Cancel",class:"speedy-modal-btn speedy-modal-btn-secondary",action:"close"},{text:"Rename",class:"speedy-modal-btn speedy-modal-btn-primary",action:"confirm"}]);l.appendChild(n);const o=n.querySelector("#rename-input");o.focus(),o.select();const s=await new Promise(i=>{const r=a=>{const p=o.value.trim();i(a&&p?p:null),n.remove()};n.querySelectorAll(".speedy-modal-btn").forEach(a=>{a.addEventListener("click",()=>r(a.textContent==="Rename"))}),o.addEventListener("keydown",a=>{a.key==="Enter"?(a.preventDefault(),r(!0)):a.key==="Escape"&&r(!1)})});if(s)try{await b("PATCH",`/api/chats/${e}/title`,{title:s}),await A()}catch(i){console.error("Error renaming chat:",i)}}async function Ze(e){try{const t=await b("GET",`/api/chats/${e}`),n=JSON.stringify(t,null,2),o=new Blob([n],{type:"application/json"}),s=URL.createObjectURL(o),i=document.createElement("a");i.href=s,i.download=`${t.title.replace(/[^a-z0-9]/gi,"_")}_${Date.now()}.json`,i.click(),URL.revokeObjectURL(s)}catch(t){console.error("Error exporting chat:",t)}}function Se(e,t,n){const o=document.createElement("div");o.className="speedy-modal-overlay";const s=document.createElement("div");return s.className="speedy-modal",s.innerHTML=`
        <div class="speedy-modal-title">${e}</div>
        <div>${t}</div>
        <div class="speedy-modal-actions">
          ${n.map(i=>`<button class="${i.class}">${i.text}</button>`).join("")}
        </div>
      `,o.appendChild(s),o.addEventListener("click",i=>{i.target===o&&o.remove()}),o}function Ke(e){const t=Math.floor((new Date-e)/1e3);return t<60?"Just now":t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:t<604800?`${Math.floor(t/86400)}d ago`:e.toLocaleDateString()}function Qe(){ne.classList.toggle("open")}function F(){ne.classList.remove("open")}function $(){console.log("🎯 [Overlay] toggleOverlay called"),console.log("🎯 [Overlay] Before toggle - isVisible:",f,"isMinimized:",W),f=!f,console.log("🎯 [Overlay] After toggle - isVisible:",f),Be(f),f?(W=!1,h.style.opacity="0",h.style.transform="translateX(-50%) scale(0)",h.style.pointerEvents="none",setTimeout(()=>{y.classList.remove("hidden"),y.classList.add("visible"),y.style.pointerEvents="auto";const e=Ae();e&&(e.width||e.height)&&(e.width&&(y.style.width=`${e.width}px`),e.height&&(y.style.maxHeight=`${e.height}px`,v.style.maxHeight=`${e.height}px`)),de(),requestAnimationFrame(()=>{m.focus();const t=document.createRange(),n=window.getSelection();m.childNodes.length>0&&(t.setStart(m.childNodes[m.childNodes.length-1],m.textContent.length),t.collapse(!0),n.removeAllRanges(),n.addRange(t))})},150)):(W=!0,y.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",y.style.transform="translateX(-50%) translateY(20px) scale(0)",y.style.opacity="0",setTimeout(()=>{y.classList.remove("visible"),y.classList.add("hidden"),y.style.pointerEvents="none",y.classList.remove("hidden"),y.style.transform="translateX(-50%) translateY(20px)",y.style.transition="",h.style.opacity="1",h.style.transform="translateX(-50%) scale(1)",h.style.pointerEvents="auto"},300),w.style.display="none",H(),m.textContent="",B="",u.disabled=!0,u.style.color="rgba(255, 255, 255, 0.5)")}async function de(){console.log("🔍 [Overlay] Requesting tabs from content script..."),window.postMessage({type:"SPEEDY_REQUEST_TABS"},"*")}function et(){console.log("🗑️ [Overlay] Clearing all context chips from UI"),R.innerHTML=""}function tt(e){var n;console.log("🗑️ [Overlay] Removing chip for tab:",e);const t=(n=R.querySelector(`[data-tab-id="${e}"]`))==null?void 0:n.parentElement;t?(t.remove(),console.log("✅ [Overlay] Chip removed from DOM")):console.warn("⚠️ [Overlay] Chip not found in DOM")}function Ce(e){if(console.log("➕ [Overlay] Adding context chip for tab:",{id:e.id,title:e.title}),R.querySelector(`[data-tab-id="${e.id}"]`)){console.log("⚠️ [Overlay] Chip already exists, skipping");return}const t=11,n=e.title.length>t?e.title.substring(0,t):e.title,o=e.title.length>t,s=e.favIconUrl||'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>',i=document.createElement("div");i.style.cssText="display: inline-flex; gap: 3px; align-items: center;";const r=document.createElement("div");r.tabIndex=0,r.dataset.tabId=e.id,r.style.cssText=`
        display: inline-flex;
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        flex-shrink: 0;
        position: relative;
        outline: none;
        visibility: visible;
      `;const a=document.createElement("div");a.className="context-chip",a.style.cssText=`
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
      `,a.innerHTML=`
        <div style="width: 18px; margin-left: -3px; margin-right: -2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative;">
          <span class="chip-favicon" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transition: opacity 150ms; opacity: 1;">
            <img src="${s}" style="width: 15px; height: 15px; border-radius: 2px; object-fit: contain;" />
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
          <span>${n}</span>${o?'<span style="font-weight: 200; opacity: 0.7;">...</span>':""}
        </div>
      `,a.addEventListener("mouseenter",()=>{const c=a.querySelector(".chip-favicon"),g=a.querySelector(".chip-close-icon");c&&(c.style.opacity="0"),g&&(g.style.opacity="1")}),a.addEventListener("mouseleave",()=>{const c=a.querySelector(".chip-favicon"),g=a.querySelector(".chip-close-icon");c&&(c.style.opacity="1"),g&&(g.style.opacity="0")});const p=a.querySelector(".remove-chip");p&&(p.addEventListener("mouseenter",()=>{p.style.color="rgba(255, 255, 255, 0.8)"}),p.addEventListener("mouseleave",()=>{p.style.color="rgba(255, 255, 255, 0.3)"}),p.addEventListener("click",c=>{c.stopPropagation(),console.log("❌ [Overlay] Remove button clicked for tab:",e.id),x=x.filter(g=>g.id!==e.id),console.log("📋 [Overlay] Updated selectedTabs:",x.map(g=>g.id)),i.remove(),ce(),V(N)})),r.appendChild(a),i.appendChild(r),R.appendChild(i),console.log("✅ [Overlay] Chip added to DOM")}function nt(e){if(console.log("🎯 [Overlay] ===== SELECT TAB ====="),console.log("🎯 [Overlay] Tab:",{id:e.id,title:e.title}),console.log("🎯 [Overlay] Current selectedTabs:",x.map(t=>({id:t.id,title:t.title}))),x.find(t=>t.id===e.id)){console.log("⚠️ [Overlay] Tab already selected, deselecting"),ot(e.id);return}console.log("🗑️ [Overlay] Clearing previous selections"),et(),x=[],console.log("➕ [Overlay] Adding new selection"),x.push(e),Ce(e),console.log("✅ [Overlay] Selection complete. selectedTabs:",x.map(t=>({id:t.id,title:t.title}))),ce(),V(N)}function ot(e){console.log("❌ [Overlay] Deselecting tab:",e),x=x.filter(t=>t.id!==e),tt(e),ce(),V(N),console.log("✅ [Overlay] Deselection complete")}function ce(){window.postMessage({type:"SPEEDY_CONTEXT_CHANGED",selectedTabs:x},"*")}function st(e){const t=document.createElement("div");t.style.cssText=`
        display: inline-flex;
        gap: 3px;
        align-items: center;
      `;const n=document.createElement("div");n.tabIndex=0,n.dataset.screenshotId=e.id,n.style.cssText=`
        display: inline-flex;
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        flex-shrink: 0;
        position: relative;
        outline: none;
        visibility: visible;
      `;const o=document.createElement("div");o.className="screenshot-chip",o.style.cssText=`
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
      `,o.innerHTML=`
        <div style="width: 18px; margin-left: -3px; margin-right: -2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative;">
          <span class="chip-favicon" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transition: opacity 150ms; opacity: 1;">
            <img src="${e.thumbnail}" style="width: 15px; height: 15px; border-radius: 2px; object-fit: cover;" />
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
      `,o.addEventListener("mouseenter",()=>{const i=o.querySelector(".chip-favicon"),r=o.querySelector(".chip-close-icon");i&&(i.style.opacity="0"),r&&(r.style.opacity="1")}),o.addEventListener("mouseleave",()=>{const i=o.querySelector(".chip-favicon"),r=o.querySelector(".chip-close-icon");i&&(i.style.opacity="1"),r&&(r.style.opacity="0")});const s=o.querySelector(".remove-chip");s&&(s.addEventListener("mouseenter",()=>{s.style.color="rgba(255, 255, 255, 0.8)"}),s.addEventListener("mouseleave",()=>{s.style.color="rgba(255, 255, 255, 0.3)"})),o.addEventListener("click",i=>{i.target.closest(".remove-chip")||it(e)}),o.querySelector(".remove-chip").addEventListener("click",i=>{i.stopPropagation(),j=j.filter(r=>r.id!==e.id),t.remove()}),n.appendChild(o),t.appendChild(n),R.appendChild(t)}function it(e){const t=document.createElement("div");t.style.cssText=`
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
      `;const n=document.createElement("img");n.src=e.dataUrl,n.style.cssText=`
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      `,t.addEventListener("click",()=>{t.remove()}),t.appendChild(n),l.appendChild(t)}function V(e){console.log("📋 [Overlay] ===== renderTabList called ====="),console.log("📋 [Overlay] Total tabs:",e.length),console.log("📋 [Overlay] Search query:",z),console.log("📋 [Overlay] Current selectedTabs:",x.map(n=>({id:n.id,title:n.title}))),N=e,ee.innerHTML="";const t=z?e.filter(n=>{const o=z.toLowerCase(),s=(n.title||"").toLowerCase().includes(o),i=(n.url||"").toLowerCase().includes(o);return s||i}):e;if(console.log("📋 [Overlay] Filtered tabs:",t.length),t.length===0){ee.innerHTML='<div style="padding: 20px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 13px;">No tabs found</div>';return}t.forEach((n,o)=>{console.log(`🔍 [Overlay] Processing tab ${o}:`,{id:n.id,title:n.title,url:n.url,hasFavIcon:!!n.favIconUrl,favIconUrl:n.favIconUrl});const s=x.find(X=>X.id===n.id);console.log("📋 [Overlay] Tab",o,":",n.title,"- Selected:",!!s);const i=document.createElement("button");i.type="button",i.style.cssText=`
          display: flex;
          width: 100%;
          text-align: left;
          padding: 8px 10px;
          font-size: 13px;
          align-items: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: background 150ms ease, opacity 150ms ease;
          border-radius: 8px;
          border: none;
          background: ${s?"rgba(96, 165, 250, 0.15)":"transparent"};
          cursor: pointer;
          opacity: ${s?"1":"0.85"};
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;const r=n.title||"Untitled",a=r.length>35?r.substring(0,35)+"...":r,p=n.url||"",c=p.length>50?p.substring(0,50)+"...":p,g=n.favIconUrl||'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>';console.log(`✅ [Overlay] Tab menu favicon for tab ${n.id}:`,g.substring(0,50)+"..."),i.innerHTML=`
          <span style="
            margin-right: 10px;
            flex-shrink: 0;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img alt="${r}" width="16" height="16" src="${g}" style="object-fit: contain; border-radius: 2px;" />
          </span>
          <div style="
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
          ">
            <div style="
              color: rgba(255, 255, 255, 0.95);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 13px;
              font-weight: 500;
            ">${a}</div>
            <div style="
              font-size: 11px;
              color: rgba(255, 255, 255, 0.45);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            ">${c}</div>
          </div>
          ${s?'<span style="margin-left: 8px; flex-shrink: 0; color: rgba(96, 165, 250, 0.8); font-size: 16px;">✓</span>':""}
        `,i.addEventListener("mouseenter",()=>{s||(i.style.background="rgba(255, 255, 255, 0.08)",i.style.opacity="1")}),i.addEventListener("mouseleave",()=>{s||(i.style.background="transparent",i.style.opacity="0.85")}),i.addEventListener("click",()=>{console.log("🖱️ [Overlay] Tab button clicked:",{id:n.id,title:n.title}),nt(n),w.style.display="none",M.style.background="transparent",z="",console.log("✅ [Overlay] Menu closed")}),ee.appendChild(i)})}U.addEventListener("click",e=>{console.log("🔧 [Overlay] Model selector clicked"),e.preventDefault();const t=T.style.display==="block";console.log("🔧 [Overlay] Model menu current state:",t?"open":"closed"),t?(console.log("🔧 [Overlay] Closing model menu"),H()):(console.log("🔧 [Overlay] Opening model menu"),Ne(),w.style.display="none")}),M.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),H(),w.style.display==="none"||!w.style.display?(z="",de(),w.style.display="block",M.style.background="rgba(255, 255, 255, 0.1)"):(w.style.display="none",M.style.background="transparent",z="")}),m.addEventListener("input",e=>{if(se(),B=m.textContent,u.disabled=!B.trim(),B.trim()?u.style.color="rgba(255, 255, 255, 1)":u.style.color="rgba(255, 255, 255, 0.5)",w.style.display==="block"){const t=m.textContent,n=t.lastIndexOf("@");n!==-1&&(z=t.substring(n+1).trim(),V(N))}}),m.addEventListener("keydown",e=>{if(e.stopPropagation(),e.key==="Escape"&&f){e.preventDefault(),$();return}if(e.key==="Enter"&&!e.shiftKey){e.preventDefault(),B.trim()&&!J&&v.dispatchEvent(new Event("submit"));return}if(e.key==="@"&&setTimeout(()=>{z="",de(),w.style.display="block",M.style.background="rgba(255, 255, 255, 0.1)"},0),e.key==="Escape"&&w.style.display==="block"){e.preventDefault(),w.style.display="none",M.style.background="transparent",z="";return}}),m.addEventListener("keypress",e=>{e.stopPropagation()}),m.addEventListener("keyup",e=>{e.stopPropagation()}),m.addEventListener("focus",()=>{v.style.boxShadow="0 0 0 1px rgba(96, 165, 250, 0.5), 0 10px 40px rgba(0, 0, 0, 0.25)",v.style.borderColor="rgba(96, 165, 250, 0.6)",H()}),I.addEventListener("mouseenter",()=>{I.style.color="rgba(255, 255, 255, 1)",I.style.background="rgba(255, 255, 255, 0.08)"}),I.addEventListener("mouseleave",()=>{I.style.color="rgba(255, 255, 255, 0.6)",I.style.background="transparent"}),m.addEventListener("blur",()=>{v.style.boxShadow="0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",v.style.borderColor="rgba(255, 255, 255, 0.15)"}),S.addEventListener("click",async e=>{e.preventDefault(),e.stopPropagation();try{window.postMessage({type:"SPEEDY_CAPTURE_SCREENSHOT"},"*")}catch(t){console.error("Screenshot failed:",t),Le("Screenshot capture failed")}}),window.addEventListener("message",e=>{if(e.source===window&&e.data.type==="SPEEDY_SCREENSHOT_CAPTURED"){const t={id:`screenshot-${Date.now()}`,dataUrl:e.data.dataUrl,timestamp:new Date().toISOString(),thumbnail:e.data.dataUrl};j.push(t),st(t),Le("Screenshot captured!")}});function Le(e,t=2e3){const n=document.createElement("div");n.style.cssText=`
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
      `,n.textContent=e,l.appendChild(n),setTimeout(()=>{n.style.opacity="1"},10),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>{n.remove()},200)},t)}v.addEventListener("submit",async e=>{if(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),!B.trim()||J)return;De();const t=B.trim(),n=[];for(const o of x)try{const i=await new Promise((r,a)=>{const p=`extract_${Date.now()}_${Math.random()}`,c=g=>{g.source===window&&g.data.type==="SPEEDY_EXTRACT_RESPONSE"&&g.data.requestId===p&&(window.removeEventListener("message",c),g.data.success?r(g.data.content):a(new Error(g.data.error||"Content extraction failed")))};window.addEventListener("message",c),window.postMessage({type:"SPEEDY_EXTRACT_TAB_CONTENT",requestId:p,tabId:o.id},"*"),setTimeout(()=>{window.removeEventListener("message",c),a(new Error("Content extraction timeout"))},5e3)});n.push({type:"tab",data:{id:o.id,title:o.title,url:o.url,content:i||"",favIconUrl:o.favIconUrl}})}catch(s){console.warn("Failed to fetch tab content for",o.title,"- continuing without content:",s.message),n.push({type:"tab",data:{id:o.id,title:o.title,url:o.url,content:"",favIconUrl:o.favIconUrl}})}j.forEach(o=>{n.push({type:"image",data:{id:o.id,dataUrl:o.dataUrl,timestamp:o.timestamp}})}),B="",m.textContent="",u.disabled=!0,u.style.color="rgba(255, 255, 255, 0.5)",se(),j=[],l.querySelectorAll(".screenshot-chip").forEach(o=>o.remove());try{await qe(t,n)}catch(o){console.error("Error sending message:",o)}}),l.addEventListener("click",e=>{if(console.log("🔧 [Overlay] Shadow root click detected",{target:e.target,isInOverlay:y.contains(e.target),isModelSelector:U.contains(e.target),isModelMenu:T.contains(e.target),isAtButton:M.contains(e.target),isTabMenu:w.contains(e.target)}),U.contains(e.target)||T.contains(e.target)||M.contains(e.target)||w.contains(e.target)){console.log("🔧 [Overlay] Click is on interactive element, not closing");return}y.contains(e.target)||(console.log("🔧 [Overlay] Click outside overlay, closing menus"),H(),w.style.display="none",M.style.background="transparent")},!0),window.addEventListener("message",e=>{if(e.source===window&&(e.data.type==="SPEEDY_TOGGLE_OVERLAY"&&(console.log("🎯 [Overlay] Received toggle command, current visibility:",f),$()),e.data.type==="SPEEDY_TABS_RESPONSE")){console.log("✅ [Overlay] Received SPEEDY_TABS_RESPONSE:",e.data);const t=e.data.tabs||[];console.log("📋 [Overlay] Tabs count:",t.length);const n=t.find(o=>o.active);n&&x.length===0&&(console.log("🔍 [Overlay] Auto-adding current tab to context:",n.title),x.push(n),Ce(n)),V(t)}}),I.addEventListener("click",()=>{Qe(),ne.classList.contains("open")&&A()}),Te.addEventListener("click",F),Oe.addEventListener("click",ke),Ie.addEventListener("input",e=>{clearTimeout(ue),ue=setTimeout(()=>{A(e.target.value)},300)});const at=$;$=function(){at(),f?(I.style.display="flex",Q.trackEvent("overlay_opened")):(I.style.display="none",F(),Q.trackEvent("overlay_closed"))},He(),A(),console.log("✅ Speedy AI Overlay initialized")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",pe):setTimeout(pe,0)})();
