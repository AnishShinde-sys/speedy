(function(){async function b($,l,p=null){return new Promise((h,m)=>{const u=`api_${Date.now()}_${Math.random()}`,k=v=>{v.source===window&&v.data.type==="SPEEDY_API_RESPONSE"&&v.data.requestId===u&&(window.removeEventListener("message",k),v.data.success?h(v.data.data):m(new Error(v.data.error||"API request failed")))};window.addEventListener("message",k),window.postMessage({type:"SPEEDY_API_REQUEST",requestId:u,method:$,endpoint:l,body:p},"*"),setTimeout(()=>{window.removeEventListener("message",k),m(new Error("API request timeout"))},3e4)})}function Ce(){return`
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
              overflow: hidden;
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
              overflow: hidden;
            ">
              <div style="min-width: 0px; max-width: 200px; position: relative; flex-shrink: 1;">
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
                  position: absolute;
                  bottom: calc(100% + 8px);
                  left: 0;
                  background: rgba(255, 255, 255, 1);
                  border-radius: 12px;
                  box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 24px, rgba(0, 0, 0, 0.05) 0px 2px 8px;
                  max-height: 350px;
                  overflow-y: auto;
                  padding: 8px;
                  z-index: 1000;
                  min-width: 280px;
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
    `}function pe(){const $=document.getElementById("speedy-ai-overlay-root");if(!$){console.error("Speedy AI: Overlay container not found");return}let l=$.shadowRoot;if(l)console.log("♻️ [Overlay] Shadow DOM already exists, reusing it"),l.innerHTML="";else try{l=$.attachShadow({mode:"open"})}catch(e){console.error("❌ [Overlay] Failed to attach shadow DOM:",e),$.remove();return}l.innerHTML=Ce();const p=l.getElementById("speedy-floating-overlay"),h=l.getElementById("speedy-fab"),m=l.getElementById("speedy-input"),u=l.getElementById("speedy-submit"),k=l.getElementById("speedy-send-icon"),v=l.getElementById("speedy-form"),L=l.getElementById("speedy-at-button"),A=l.getElementById("speedy-paperclip-icon"),D=l.getElementById("speedy-crop-icon"),w=l.getElementById("speedy-tab-menu"),Q=l.getElementById("speedy-tab-list"),R=l.getElementById("speedy-context-pills"),U=l.getElementById("speedy-model-selector"),M=l.getElementById("speedy-model-menu"),ee=l.getElementById("speedy-model-name"),ge=l.getElementById("speedy-model-chevron"),te=l.getElementById("all-models"),T=l.getElementById("speedy-messages-list"),C=l.getElementById("speedy-image-upload"),S=l.getElementById("speedy-screenshot-capture"),I=l.getElementById("speedy-sidebar-toggle-top"),ne=l.getElementById("speedy-chat-sidebar"),Le=l.getElementById("speedy-sidebar-close"),Me=l.getElementById("speedy-new-chat-btn"),Te=l.getElementById("speedy-chat-search"),X=l.getElementById("speedy-chat-list");let B="",f=!1,G=!0,x=[];function Ie(){console.log("🔍 [Overlay] Requesting overlay state from content script"),console.log("🔍 [Overlay] Current isVisible:",f),window.postMessage({type:"SPEEDY_GET_OVERLAY_STATE"},"*")}function Oe(e){console.log("💾 [Overlay] Saving overlay state:",e),console.log("💾 [Overlay] Current isVisible:",f),window.postMessage({type:"SPEEDY_SAVE_OVERLAY_STATE",isVisible:e},"*")}window.addEventListener("message",e=>{if(e.source===window){if(e.data.type==="SPEEDY_OVERLAY_STATE_RESPONSE"){console.log("📨 [Overlay] Received overlay state response:",e.data.state),console.log("📨 [Overlay] Current isVisible:",f);const t=e.data.state;t&&t.isVisible&&!f?(console.log("✅ [Overlay] State says visible=true, opening overlay"),setTimeout(()=>{P()},100)):console.log("⏭️ [Overlay] No action needed. State visible:",t==null?void 0:t.isVisible,"Current visible:",f)}if(e.data.type==="SPEEDY_OVERLAY_STATE_CHANGED"){console.log("🔄 [Overlay] Received state change from another tab:",e.data.state),console.log("🔄 [Overlay] Current isVisible:",f);const t=e.data.state;t&&t.isVisible!==f?(console.log("✅ [Overlay] State mismatch! Syncing... New state:",t.isVisible),P()):console.log("⏭️ [Overlay] States match, no sync needed")}}}),console.log("🚀 [Overlay] Initializing overlay state sync"),Ie();let N=[],O="anthropic/claude-3.5-sonnet",Y=[],ye=!0,E=null,se=[],W=!1,j=[],J=[],me=null,z="";const ze=["openai/gpt-4o","openai/gpt-3.5-turbo","anthropic/claude-3.5-sonnet","anthropic/claude-3-haiku","google/gemini-pro","google/gemini-flash"];function oe(){if(m.getAttribute("data-placeholder"),m.textContent.trim()===""&&(m.innerHTML=""),m.textContent.trim()===""&&(m.style.setProperty("--placeholder-visible","block"),!m.hasAttribute("data-placeholder-added"))){const e=document.createElement("style");e.textContent=`
            #speedy-input:empty:before {
              content: attr(data-placeholder);
              color: rgba(255, 255, 255, 0.5);
              opacity: 0.5;
              pointer-events: none;
              position: absolute;
            }
          `,l.appendChild(e),m.setAttribute("data-placeholder-added","true")}}function ue(){try{return location.hostname||"default"}catch{return"default"}}function Be(){const e=`speedy_overlay_size_${ue()}`,t=localStorage.getItem(e);if(!t)return null;try{return JSON.parse(t)}catch{return null}}function _e(e,t){const n=`speedy_overlay_size_${ue()}`,s=JSON.stringify({width:e,height:t});localStorage.setItem(n,s)}oe();let Z=!1,ie="",d={x:0,y:0,width:0,height:0,left:0,top:0};function $e(e,t){e.preventDefault(),e.stopPropagation(),Z=!0,ie=t;const n=p.getBoundingClientRect();d.x=e.clientX,d.y=e.clientY,d.width=n.width,d.height=n.height,d.left=n.left,d.top=n.top,dragOffset.x=e.clientX-n.left,dragOffset.y=e.clientY-n.top,p.style.transition="none",document.body.style.cursor=e.target.style.cursor,document.addEventListener("mousemove",he),document.addEventListener("mouseup",fe)}function he(e){if(!Z)return;const t=e.clientX-d.x,n=e.clientY-d.y;let s=d.width,o=d.height,i=d.left,r=d.top;const a=350,c=250,g=window.innerWidth-20,y=window.innerHeight-20;switch(ie){case"se":s=Math.max(a,Math.min(g,d.width+t)),o=Math.max(c,Math.min(y,d.height+n));break;case"sw":s=Math.max(a,Math.min(g,d.width-t)),o=Math.max(c,Math.min(y,d.height+n)),i=d.left+(d.width-s);break;case"ne":s=Math.max(a,Math.min(g,d.width+t)),o=Math.max(c,Math.min(y,d.height-n)),r=d.top+(d.height-o);break;case"nw":s=Math.max(a,Math.min(g,d.width-t)),o=Math.max(c,Math.min(y,d.height-n)),i=d.left+(d.width-s),r=d.top+(d.height-o);break;case"n":o=Math.max(c,Math.min(y,d.height-n)),r=d.top+(d.height-o);break;case"s":o=Math.max(c,Math.min(y,d.height+n));break;case"e":s=Math.max(a,Math.min(g,d.width+t));break;case"w":s=Math.max(a,Math.min(g,d.width-t)),i=d.left+(d.width-s);break}p.style.width=`${s}px`,p.style.maxHeight=`${o}px`,v.style.maxHeight=`${o}px`,(i!==d.left||r!==d.top)&&(p.style.left=`${i}px`,p.style.top=`${r}px`)}function fe(){if(!Z)return;Z=!1,ie="",p.style.transition="",document.body.style.cursor="",document.removeEventListener("mousemove",he),document.removeEventListener("mouseup",fe);const e=p.getBoundingClientRect();_e(e.width,e.height)}l.querySelectorAll(".resize-handle").forEach(e=>{const t=e.classList[1].replace("resize-","");e.addEventListener("mousedown",n=>$e(n,t))}),h.addEventListener("click",()=>{G&&P()}),h.addEventListener("mouseenter",()=>{h.style.transform="translateX(-50%) scale(1.1)",h.style.boxShadow="0 6px 20px rgba(0, 0, 0, 0.3)"}),h.addEventListener("mouseleave",()=>{h.style.transform="translateX(-50%) scale(1)",h.style.boxShadow="0 4px 16px rgba(0, 0, 0, 0.2)"}),setTimeout(()=>{h.style.opacity="1",h.style.transform="translateX(-50%) scale(1)",h.style.pointerEvents="auto"},500),u.addEventListener("mouseenter",()=>{u.disabled||(u.style.transform="scale(1.1)",u.style.color="rgba(255, 255, 255, 0.9)",k.style.transform="translateX(2px) translateY(-2px) rotate(-5deg)")}),u.addEventListener("mouseleave",()=>{u.disabled||(u.style.transform="scale(1)",u.style.color="rgba(255, 255, 255, 0.5)",k.style.transform="translateX(0) translateY(0) rotate(0deg)")}),u.addEventListener("mousedown",()=>{u.disabled||(u.style.transform="scale(0.95)")}),u.addEventListener("mouseup",()=>{u.disabled||(u.style.transform="scale(1.1)")});function Pe(){k.style.transform="translateX(20px) translateY(-20px) rotate(45deg)",k.style.opacity="0",setTimeout(()=>{k.style.transition="none",k.style.transform="translateX(0) translateY(0) rotate(0deg)",k.style.opacity="1",setTimeout(()=>{k.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"},50)},300)}C.addEventListener("mouseenter",()=>{C.style.transform="scale(1.15)",C.style.color="rgba(255, 255, 255, 1)",A.style.transform="rotate(-15deg) translateY(-1px)",setTimeout(()=>{A.style.transform="rotate(15deg) translateY(-1px)"},100),setTimeout(()=>{A.style.transform="rotate(-10deg) translateY(-1px)"},200)}),C.addEventListener("mouseleave",()=>{C.style.transform="scale(1)",C.style.color="rgba(255, 255, 255, 0.9)",A.style.transform="rotate(0deg) translateY(0)"}),C.addEventListener("mousedown",()=>{C.style.transform="scale(0.9)",A.style.transform="rotate(-25deg)"}),C.addEventListener("mouseup",()=>{C.style.transform="scale(1.15)",A.style.transform="rotate(-10deg) translateY(-1px)"}),S.addEventListener("mouseenter",()=>{S.style.transform="scale(1.15)",S.style.color="rgba(255, 255, 255, 1)",D.style.transform="scale(1.2)",setTimeout(()=>{D.style.transform="scale(0.9)"},100),setTimeout(()=>{D.style.transform="scale(1.15)"},200)}),S.addEventListener("mouseleave",()=>{S.style.transform="scale(1)",S.style.color="rgba(255, 255, 255, 0.9)",D.style.transform="scale(1)"}),S.addEventListener("mousedown",()=>{S.style.transform="scale(0.85)",D.style.transform="scale(0.7)"}),S.addEventListener("mouseup",()=>{S.style.transform="scale(1.15)",D.style.transform="scale(1.15)"});async function Ae(){try{const e=await b("GET","/api/openrouter/models");if(e.data&&Array.isArray(e.data)){const t=["openai/gpt-4o","openai/gpt-4o-mini","openai/gpt-4-turbo","openai/gpt-3.5-turbo","openai/o1-mini","anthropic/claude-3.5-sonnet","anthropic/claude-3.5-haiku","anthropic/claude-3-opus","anthropic/claude-3-haiku","google/gemini-2.5-flash","google/gemini-pro","google/gemini-flash","x-ai/grok-4","x-ai/grok-4-fast"];Y=e.data.filter(s=>t.includes(s.id)).sort((s,o)=>{const i=(s.name||s.id).toLowerCase(),r=(o.name||o.id).toLowerCase();return i.localeCompare(r)})}}catch(e){console.error("Error fetching models:",e),Y=ze.map(t=>({id:t,name:t.split("/").pop()}))}finally{ye=!1,K(),xe()}}function De(e){const t=Y.find(o=>o.id===e);if(t!=null&&t.name){const o=t.name.toLowerCase();return o.includes("sonnet")?"sonnet":o.includes("haiku")?"haiku":o.includes("opus")?"opus":o.includes("gpt-4")?"gpt-4":o.includes("gpt-3.5")?"gpt-3.5":o.includes("gemini")?"gemini":o.includes("llama")?"llama":t.name}const n=e.split("/"),s=n[n.length-1];return s.includes("sonnet")?"sonnet":s.includes("haiku")?"haiku":s.includes("opus")?"opus":s.includes("gpt-4")?"gpt-4":s.includes("gpt-3.5")?"gpt-3.5":s.split("-")[0]}function xe(){te.innerHTML="",Y.forEach(e=>{const t=He(e);te.appendChild(t)})}function He(e){const t=document.createElement("button");t.type="button";const n=O===e.id;let s=e.name||e.id.split("/").pop();return s=s.replace(/^(gpt-|claude-|gemini-|grok-)/i,"").replace(/-/g," ").replace(/\b\w/g,o=>o.toUpperCase()),t.style.cssText=`
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
      `,t.textContent=s,t.addEventListener("mouseenter",()=>{n||(t.style.background="rgba(243, 244, 246, 1)")}),t.addEventListener("mouseleave",()=>{n||(t.style.background="transparent")}),t.addEventListener("click",()=>{O=e.id,K(),xe(),H()}),t}function H(){M.style.display="none",ge.style.transform="rotate(0deg)",U.style.background="transparent"}function Re(){console.log("🔧 [Overlay] openModelMenu called",{menuElement:M,menuDisplay:M.style.display,menuChildCount:M.children.length,allModelsChildCount:te.children.length,availableModelsCount:Y.length}),M.style.display="block",ge.style.transform="rotate(180deg)",U.style.background="rgba(255, 255, 255, 0.05)",console.log("🔧 [Overlay] Menu display set to block, computed style:",window.getComputedStyle(M).display)}function K(){const e=O.split("/").pop();ee.textContent=e}async function Ue(){if(E)return E;const e=localStorage.getItem("speedy_last_chat_id");if(e)try{if(await b("GET",`/api/chats/${e}`))return E=e,await we(e),E}catch{console.log("Saved chat not found, creating new one"),localStorage.removeItem("speedy_last_chat_id")}try{return E=(await b("POST","/api/chats",{title:"New Chat",model:O}))._id,localStorage.setItem("speedy_last_chat_id",E),await _(),E}catch(t){return console.error("Error creating chat:",t),null}}function ae(e,t,n=!1){T.style.display="flex";const s=document.createElement("div");s.className=`speedy-message-wrapper ${e}`;const o=document.createElement("div");o.className="speedy-message-content";const i=document.createElement("div");i.className=`speedy-message speedy-message-${e}`,n&&i.classList.add("speedy-message-streaming"),i.innerHTML=be(t,e);const r=document.createElement("span");r.className="speedy-message-timestamp";const a=new Date;return r.textContent=a.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),o.appendChild(i),o.appendChild(r),s.appendChild(o),T.appendChild(s),re(),i}function be(e,t){if(!e)return"";if(t==="user")return q(e);let n=q(e);return n=n.replace(/`([^`]+)`/g,"<code>$1</code>"),n=n.replace(/```([^`]+)```/g,"<pre><code>$1</code></pre>"),n=n.replace(/\*\*([^\*]+)\*\*/g,"<strong>$1</strong>"),n}function q(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Ne(e,t){const n=e.classList.contains("speedy-message-user")?"user":"assistant";e.innerHTML=be(t,n),re()}function re(){T.scrollTop=T.scrollHeight}async function Ye(e,t=[]){const n=await Ue();if(!n){console.error("Failed to create chat");return}ae("user",e),await b("POST",`/api/chats/${n}/message`,{role:"user",content:e,context:t});const o=(await b("GET",`/api/chats/${n}`)).messages.map(a=>({role:a.role,content:qe(a.content,a.context)}));W=!0;const i=ae("assistant","",!0);let r="";try{const a=await b("POST","/api/openrouter/chat",{messages:o,model:O,stream:!1});a.choices&&a.choices[0]&&a.choices[0].message&&(r=a.choices[0].message.content,await je(i,r)),await b("POST",`/api/chats/${n}/message`,{role:"assistant",content:r,context:[]}),i.classList.remove("speedy-message-streaming");const c=await b("GET",`/api/chats/${n}`);if(c.messages.length===2&&c.title==="New Chat"){console.log("🏷️ [Overlay] Auto-generating chat title...");try{await b("POST",`/api/chats/${n}/generate-title`),console.log("✅ [Overlay] Chat title generated successfully")}catch(g){console.error("❌ [Overlay] Failed to generate chat title:",g)}}J.length>0&&await _()}catch(a){console.error("Error streaming response:",a),i.textContent="Error: Failed to get response"}finally{W=!1}}async function je(e,t){const n=t.split(" ");let s="";for(let o=0;o<n.length;o++)s+=(o>0?" ":"")+n[o],Ne(e,s),re(),await new Promise(i=>setTimeout(i,30))}function qe(e,t=[]){if(!t||t.length===0)return e;let n=`<additional_information>
`;n+=`Below is additional context information:

`;for(const s of t)s.type==="tab"&&(n+=`<content source="webpage" title="${s.data.title}" url="${s.data.url}">
`,n+=`${s.data.content}
</content>

`);return n+=`</additional_information>

`,n+e}async function _(e=""){try{const t=e?`/api/chats?search=${encodeURIComponent(e)}`:"/api/chats",n=await b("GET",t);J=n.chats||n,ve()}catch(t){console.error("Error loading chats:",t),X.innerHTML=`
          <div class="speedy-empty-state">
            <div class="speedy-empty-state-icon">⚠️</div>
            <div>Failed to load chats</div>
          </div>
        `}}function ve(){if(J.length===0){X.innerHTML=`
          <div class="speedy-empty-state">
            <div class="speedy-empty-state-icon">💬</div>
            <div>No chats yet</div>
            <div style="font-size: 12px; margin-top: 8px;">Start a new conversation!</div>
          </div>
        `;return}X.innerHTML="",J.forEach(e=>{const t=Fe(e);X.appendChild(t)})}function Fe(e){const t=document.createElement("div");t.className="speedy-chat-item",e._id===E&&t.classList.add("active");const n=e.messages&&e.messages.length>0?e.messages[e.messages.length-1].content:"No messages yet",s=e.messages?e.messages.length:0,o=new Date(e.updatedAt),i=Je(o);return t.innerHTML=`
        <div class="speedy-chat-item-title">${q(e.title)}</div>
        <div class="speedy-chat-item-preview">${q(n.substring(0,60))}${n.length>60?"...":""}</div>
        <div class="speedy-chat-item-meta">
          <span>${s} messages</span>
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
      `,t.addEventListener("click",async a=>{a.target.closest(".speedy-chat-action-btn")||await Ve(e._id)}),t.querySelectorAll(".speedy-chat-action-btn").forEach(a=>{a.addEventListener("click",async c=>{c.stopPropagation();const g=a.dataset.action;g==="delete"?await Xe(e._id):g==="rename"?await Ge(e._id,e.title):g==="export"&&await We(e._id)})}),t}async function Ve(e){if(e===E){F();return}E=e,localStorage.setItem("speedy_last_chat_id",e),T.innerHTML="",se=[],await we(e),ve(),F()}async function we(e){try{const t=await b("GET",`/api/chats/${e}`);t.messages&&t.messages.length>0?(T.style.display="flex",t.messages.forEach(n=>{ae(n.role,n.content,!1)}),se=t.messages):T.style.display="none",t.model&&t.model!==O&&(O=t.model,K())}catch(t){console.error("Error loading chat messages:",t)}}async function Ee(){try{E=(await b("POST","/api/chats",{title:"New Chat",model:O}))._id,localStorage.setItem("speedy_last_chat_id",E),T.innerHTML="",T.style.display="none",se=[],await _(),F()}catch(e){console.error("Error creating new chat:",e)}}async function Xe(e){const t=ke("Delete Chat","Are you sure you want to delete this chat? This action cannot be undone.",[{text:"Cancel",class:"speedy-modal-btn speedy-modal-btn-secondary",action:"close"},{text:"Delete",class:"speedy-modal-btn speedy-modal-btn-danger",action:"confirm"}]);if(l.appendChild(t),!!await new Promise(s=>{t.querySelectorAll(".speedy-modal-btn").forEach(o=>{o.addEventListener("click",()=>{s(o.textContent==="Delete"),t.remove()})})}))try{await b("DELETE",`/api/chats/${e}`),e===E?await Ee():await _()}catch(s){console.error("Error deleting chat:",s)}}async function Ge(e,t){const n=ke("Rename Chat",`<input type="text" class="speedy-modal-input" id="rename-input" value="${q(t)}" placeholder="Enter new title">`,[{text:"Cancel",class:"speedy-modal-btn speedy-modal-btn-secondary",action:"close"},{text:"Rename",class:"speedy-modal-btn speedy-modal-btn-primary",action:"confirm"}]);l.appendChild(n);const s=n.querySelector("#rename-input");s.focus(),s.select();const o=await new Promise(i=>{const r=a=>{const c=s.value.trim();i(a&&c?c:null),n.remove()};n.querySelectorAll(".speedy-modal-btn").forEach(a=>{a.addEventListener("click",()=>r(a.textContent==="Rename"))}),s.addEventListener("keydown",a=>{a.key==="Enter"?(a.preventDefault(),r(!0)):a.key==="Escape"&&r(!1)})});if(o)try{await b("PATCH",`/api/chats/${e}/title`,{title:o}),await _()}catch(i){console.error("Error renaming chat:",i)}}async function We(e){try{const t=await b("GET",`/api/chats/${e}`),n=JSON.stringify(t,null,2),s=new Blob([n],{type:"application/json"}),o=URL.createObjectURL(s),i=document.createElement("a");i.href=o,i.download=`${t.title.replace(/[^a-z0-9]/gi,"_")}_${Date.now()}.json`,i.click(),URL.revokeObjectURL(o)}catch(t){console.error("Error exporting chat:",t)}}function ke(e,t,n){const s=document.createElement("div");s.className="speedy-modal-overlay";const o=document.createElement("div");return o.className="speedy-modal",o.innerHTML=`
        <div class="speedy-modal-title">${e}</div>
        <div>${t}</div>
        <div class="speedy-modal-actions">
          ${n.map(i=>`<button class="${i.class}">${i.text}</button>`).join("")}
        </div>
      `,s.appendChild(o),s.addEventListener("click",i=>{i.target===s&&s.remove()}),s}function Je(e){const t=Math.floor((new Date-e)/1e3);return t<60?"Just now":t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:t<604800?`${Math.floor(t/86400)}d ago`:e.toLocaleDateString()}function Ze(){ne.classList.toggle("open")}function F(){ne.classList.remove("open")}function P(){console.log("🎯 [Overlay] toggleOverlay called"),console.log("🎯 [Overlay] Before toggle - isVisible:",f,"isMinimized:",G),f=!f,console.log("🎯 [Overlay] After toggle - isVisible:",f),Oe(f),f?(G=!1,h.style.opacity="0",h.style.transform="translateX(-50%) scale(0)",h.style.pointerEvents="none",setTimeout(()=>{p.classList.remove("hidden"),p.classList.add("visible"),p.style.pointerEvents="auto";const e=Be();e&&(e.width||e.height)&&(e.width&&(p.style.width=`${e.width}px`),e.height&&(p.style.maxHeight=`${e.height}px`,v.style.maxHeight=`${e.height}px`)),le(),requestAnimationFrame(()=>{m.focus();const t=document.createRange(),n=window.getSelection();m.childNodes.length>0&&(t.setStart(m.childNodes[m.childNodes.length-1],m.textContent.length),t.collapse(!0),n.removeAllRanges(),n.addRange(t))})},150)):(G=!0,p.style.transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",p.style.transform="translateX(-50%) translateY(20px) scale(0)",p.style.opacity="0",setTimeout(()=>{p.classList.remove("visible"),p.classList.add("hidden"),p.style.pointerEvents="none",p.classList.remove("hidden"),p.style.transform="translateX(-50%) translateY(20px)",p.style.transition="",h.style.opacity="1",h.style.transform="translateX(-50%) scale(1)",h.style.pointerEvents="auto"},300),w.style.display="none",H(),m.textContent="",B="",u.disabled=!0,u.style.color="rgba(255, 255, 255, 0.5)")}async function le(){console.log("🔍 [Overlay] Requesting tabs from content script..."),window.postMessage({type:"SPEEDY_REQUEST_TABS"},"*")}function Ke(){console.log("🗑️ [Overlay] Clearing all context chips from UI"),R.innerHTML=""}function Qe(e){var n;console.log("🗑️ [Overlay] Removing chip for tab:",e);const t=(n=R.querySelector(`[data-tab-id="${e}"]`))==null?void 0:n.parentElement;t?(t.remove(),console.log("✅ [Overlay] Chip removed from DOM")):console.warn("⚠️ [Overlay] Chip not found in DOM")}function Se(e){if(console.log("➕ [Overlay] Adding context chip for tab:",{id:e.id,title:e.title}),R.querySelector(`[data-tab-id="${e.id}"]`)){console.log("⚠️ [Overlay] Chip already exists, skipping");return}const t=11,n=e.title.length>t?e.title.substring(0,t):e.title,s=e.title.length>t,o=e.favIconUrl||'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>',i=document.createElement("div");i.style.cssText="display: inline-flex; gap: 3px; align-items: center;";const r=document.createElement("div");r.tabIndex=0,r.dataset.tabId=e.id,r.style.cssText=`
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
            <img src="${o}" style="width: 15px; height: 15px; border-radius: 2px; object-fit: contain;" />
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
          <span>${n}</span>${s?'<span style="font-weight: 200; opacity: 0.7;">...</span>':""}
        </div>
      `,a.addEventListener("mouseenter",()=>{const g=a.querySelector(".chip-favicon"),y=a.querySelector(".chip-close-icon");g&&(g.style.opacity="0"),y&&(y.style.opacity="1")}),a.addEventListener("mouseleave",()=>{const g=a.querySelector(".chip-favicon"),y=a.querySelector(".chip-close-icon");g&&(g.style.opacity="1"),y&&(y.style.opacity="0")});const c=a.querySelector(".remove-chip");c&&(c.addEventListener("mouseenter",()=>{c.style.color="rgba(255, 255, 255, 0.8)"}),c.addEventListener("mouseleave",()=>{c.style.color="rgba(255, 255, 255, 0.3)"}),c.addEventListener("click",g=>{g.stopPropagation(),console.log("❌ [Overlay] Remove button clicked for tab:",e.id),x=x.filter(y=>y.id!==e.id),console.log("📋 [Overlay] Updated selectedTabs:",x.map(y=>y.id)),i.remove(),de(),V(N)})),r.appendChild(a),i.appendChild(r),R.appendChild(i),console.log("✅ [Overlay] Chip added to DOM")}function et(e){if(console.log("🎯 [Overlay] ===== SELECT TAB ====="),console.log("🎯 [Overlay] Tab:",{id:e.id,title:e.title}),console.log("🎯 [Overlay] Current selectedTabs:",x.map(t=>({id:t.id,title:t.title}))),x.find(t=>t.id===e.id)){console.log("⚠️ [Overlay] Tab already selected, deselecting"),tt(e.id);return}console.log("🗑️ [Overlay] Clearing previous selections"),Ke(),x=[],console.log("➕ [Overlay] Adding new selection"),x.push(e),Se(e),console.log("✅ [Overlay] Selection complete. selectedTabs:",x.map(t=>({id:t.id,title:t.title}))),de(),V(N)}function tt(e){console.log("❌ [Overlay] Deselecting tab:",e),x=x.filter(t=>t.id!==e),Qe(e),de(),V(N),console.log("✅ [Overlay] Deselection complete")}function de(){window.postMessage({type:"SPEEDY_CONTEXT_CHANGED",selectedTabs:x},"*")}function nt(e){const t=document.createElement("div");t.style.cssText=`
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
      `;const s=document.createElement("div");s.className="screenshot-chip",s.style.cssText=`
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
      `,s.innerHTML=`
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
      `,s.addEventListener("mouseenter",()=>{const i=s.querySelector(".chip-favicon"),r=s.querySelector(".chip-close-icon");i&&(i.style.opacity="0"),r&&(r.style.opacity="1")}),s.addEventListener("mouseleave",()=>{const i=s.querySelector(".chip-favicon"),r=s.querySelector(".chip-close-icon");i&&(i.style.opacity="1"),r&&(r.style.opacity="0")});const o=s.querySelector(".remove-chip");o&&(o.addEventListener("mouseenter",()=>{o.style.color="rgba(255, 255, 255, 0.8)"}),o.addEventListener("mouseleave",()=>{o.style.color="rgba(255, 255, 255, 0.3)"})),s.addEventListener("click",i=>{i.target.closest(".remove-chip")||st(e)}),s.querySelector(".remove-chip").addEventListener("click",i=>{i.stopPropagation(),j=j.filter(r=>r.id!==e.id),t.remove()}),n.appendChild(s),t.appendChild(n),R.appendChild(t)}function st(e){const t=document.createElement("div");t.style.cssText=`
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
      `,t.addEventListener("click",()=>{t.remove()}),t.appendChild(n),l.appendChild(t)}function V(e){console.log("📋 [Overlay] ===== renderTabList called ====="),console.log("📋 [Overlay] Total tabs:",e.length),console.log("📋 [Overlay] Search query:",z),console.log("📋 [Overlay] Current selectedTabs:",x.map(n=>({id:n.id,title:n.title}))),N=e,Q.innerHTML="";const t=z?e.filter(n=>{const s=z.toLowerCase(),o=(n.title||"").toLowerCase().includes(s),i=(n.url||"").toLowerCase().includes(s);return o||i}):e;if(console.log("📋 [Overlay] Filtered tabs:",t.length),t.length===0){Q.innerHTML='<div style="padding: 20px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 13px;">No tabs found</div>';return}t.forEach((n,s)=>{console.log(`🔍 [Overlay] Processing tab ${s}:`,{id:n.id,title:n.title,url:n.url,hasFavIcon:!!n.favIconUrl,favIconUrl:n.favIconUrl});const o=x.find(it=>it.id===n.id);console.log("📋 [Overlay] Tab",s,":",n.title,"- Selected:",!!o);const i=document.createElement("button");i.type="button",i.style.cssText=`
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
          background: ${o?"rgba(96, 165, 250, 0.15)":"transparent"};
          cursor: pointer;
          opacity: ${o?"1":"0.85"};
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;const r=n.title||"Untitled",a=r.length>35?r.substring(0,35)+"...":r,c=n.url||"",g=c.length>50?c.substring(0,50)+"...":c,y=n.favIconUrl||'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>';console.log(`✅ [Overlay] Tab menu favicon for tab ${n.id}:`,y.substring(0,50)+"..."),i.innerHTML=`
          <span style="
            margin-right: 10px;
            flex-shrink: 0;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img alt="${r}" width="16" height="16" src="${y}" style="object-fit: contain; border-radius: 2px;" />
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
            ">${g}</div>
          </div>
          ${o?'<span style="margin-left: 8px; flex-shrink: 0; color: rgba(96, 165, 250, 0.8); font-size: 16px;">✓</span>':""}
        `,i.addEventListener("mouseenter",()=>{o||(i.style.background="rgba(255, 255, 255, 0.08)",i.style.opacity="1")}),i.addEventListener("mouseleave",()=>{o||(i.style.background="transparent",i.style.opacity="0.85")}),i.addEventListener("click",()=>{console.log("🖱️ [Overlay] Tab button clicked:",{id:n.id,title:n.title}),et(n),w.style.display="none",L.style.background="transparent",z="",console.log("✅ [Overlay] Menu closed")}),Q.appendChild(i)})}U.addEventListener("click",e=>{console.log("🔧 [Overlay] Model selector clicked"),e.preventDefault();const t=M.style.display==="block";console.log("🔧 [Overlay] Model menu current state:",t?"open":"closed"),t?(console.log("🔧 [Overlay] Closing model menu"),H()):(console.log("🔧 [Overlay] Opening model menu"),Re(),w.style.display="none")}),L.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),H(),w.style.display==="none"||!w.style.display?(z="",le(),w.style.display="block",L.style.background="rgba(255, 255, 255, 0.1)"):(w.style.display="none",L.style.background="transparent",z="")}),m.addEventListener("input",e=>{if(oe(),B=m.textContent,u.disabled=!B.trim(),B.trim()?u.style.color="rgba(255, 255, 255, 1)":u.style.color="rgba(255, 255, 255, 0.5)",w.style.display==="block"){const t=m.textContent,n=t.lastIndexOf("@");n!==-1&&(z=t.substring(n+1).trim(),V(N))}}),m.addEventListener("keydown",e=>{if(e.stopPropagation(),e.key==="Escape"&&f){e.preventDefault(),P();return}if(e.key==="Enter"&&!e.shiftKey){e.preventDefault(),B.trim()&&!W&&v.dispatchEvent(new Event("submit"));return}if(e.key==="@"&&setTimeout(()=>{z="",le(),w.style.display="block",L.style.background="rgba(255, 255, 255, 0.1)"},0),e.key==="Escape"&&w.style.display==="block"){e.preventDefault(),w.style.display="none",L.style.background="transparent",z="";return}}),m.addEventListener("keypress",e=>{e.stopPropagation()}),m.addEventListener("keyup",e=>{e.stopPropagation()}),m.addEventListener("focus",()=>{v.style.boxShadow="0 0 0 1px rgba(96, 165, 250, 0.5), 0 10px 40px rgba(0, 0, 0, 0.25)",v.style.borderColor="rgba(96, 165, 250, 0.6)",H()}),I.addEventListener("mouseenter",()=>{I.style.color="rgba(255, 255, 255, 1)",I.style.background="rgba(255, 255, 255, 0.08)"}),I.addEventListener("mouseleave",()=>{I.style.color="rgba(255, 255, 255, 0.6)",I.style.background="transparent"}),m.addEventListener("blur",()=>{v.style.boxShadow="0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",v.style.borderColor="rgba(255, 255, 255, 0.15)"}),S.addEventListener("click",async e=>{e.preventDefault(),e.stopPropagation();try{const t=`screenshot_${Date.now()}`,n=s=>{if(s.source===window&&s.data.type==="SPEEDY_SCREENSHOT_RESPONSE"&&s.data.requestId===t)if(window.removeEventListener("message",n),s.data.success&&s.data.dataUrl){const o={id:`screenshot-${Date.now()}`,dataUrl:s.data.dataUrl,timestamp:new Date().toISOString(),thumbnail:s.data.dataUrl};j.push(o),nt(o),ce("Screenshot captured!")}else ce("Screenshot capture failed")};window.addEventListener("message",n),window.postMessage({type:"SPEEDY_CAPTURE_SCREENSHOT",requestId:t},"*"),setTimeout(()=>{window.removeEventListener("message",n)},5e3)}catch(t){console.error("Screenshot failed:",t),ce("Screenshot capture failed")}});function ce(e,t=2e3){const n=document.createElement("div");n.style.cssText=`
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
      `,n.textContent=e,l.appendChild(n),setTimeout(()=>{n.style.opacity="1"},10),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>{n.remove()},200)},t)}v.addEventListener("submit",async e=>{if(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),!B.trim()||W)return;Pe();const t=B.trim(),n=[];for(const s of x)try{const i=await new Promise((r,a)=>{const c=`extract_${Date.now()}_${Math.random()}`,g=y=>{y.source===window&&y.data.type==="SPEEDY_EXTRACT_RESPONSE"&&y.data.requestId===c&&(window.removeEventListener("message",g),y.data.success?r(y.data.content):a(new Error(y.data.error||"Content extraction failed")))};window.addEventListener("message",g),window.postMessage({type:"SPEEDY_EXTRACT_TAB_CONTENT",requestId:c,tabId:s.id},"*"),setTimeout(()=>{window.removeEventListener("message",g),a(new Error("Content extraction timeout"))},5e3)});n.push({type:"tab",data:{id:s.id,title:s.title,url:s.url,content:i||"",favIconUrl:s.favIconUrl}})}catch(o){console.warn("Failed to fetch tab content for",s.title,"- continuing without content:",o.message),n.push({type:"tab",data:{id:s.id,title:s.title,url:s.url,content:"",favIconUrl:s.favIconUrl}})}j.forEach(s=>{n.push({type:"image",data:{id:s.id,dataUrl:s.dataUrl,timestamp:s.timestamp}})}),B="",m.textContent="",u.disabled=!0,u.style.color="rgba(255, 255, 255, 0.5)",oe(),j=[],l.querySelectorAll(".screenshot-chip").forEach(s=>s.remove());try{await Ye(t,n)}catch(s){console.error("Error sending message:",s)}}),l.addEventListener("click",e=>{if(console.log("🔧 [Overlay] Shadow root click detected",{target:e.target,isInOverlay:p.contains(e.target),isModelSelector:U.contains(e.target),isModelMenu:M.contains(e.target),isAtButton:L.contains(e.target),isTabMenu:w.contains(e.target)}),U.contains(e.target)||M.contains(e.target)||L.contains(e.target)||w.contains(e.target)){console.log("🔧 [Overlay] Click is on interactive element, not closing");return}p.contains(e.target)||(console.log("🔧 [Overlay] Click outside overlay, closing menus"),H(),w.style.display="none",L.style.background="transparent")},!0),window.addEventListener("message",e=>{if(e.source===window&&(e.data.type==="SPEEDY_TOGGLE_OVERLAY"&&(console.log("🎯 [Overlay] Received toggle command, current visibility:",f),P()),e.data.type==="SPEEDY_TABS_RESPONSE")){console.log("✅ [Overlay] Received SPEEDY_TABS_RESPONSE:",e.data);const t=e.data.tabs||[];console.log("📋 [Overlay] Tabs count:",t.length);const n=t.find(s=>s.active);n&&x.length===0&&(console.log("🔍 [Overlay] Auto-adding current tab to context:",n.title),x.push(n),Se(n)),V(t)}}),I.addEventListener("click",()=>{Ze(),ne.classList.contains("open")&&_()}),Le.addEventListener("click",F),Me.addEventListener("click",Ee),Te.addEventListener("input",e=>{clearTimeout(me),me=setTimeout(()=>{_(e.target.value)},300)});const ot=P;P=function(){ot(),f?I.style.display="flex":(I.style.display="none",F())},Ae(),_(),console.log("✅ Speedy AI Overlay initialized")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",pe):setTimeout(pe,0)})();
