// Speedy AI Overlay - Cursor-Style Composer
(function() {
  'use strict';

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
          gap: 8px;
          margin-bottom: 12px;
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
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 19px;
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
          backdrop-filter: saturate(150%);
          -webkit-backdrop-filter: saturate(150%);
        }
        
        .speedy-message-assistant {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .speedy-message-timestamp {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
          padding: 0 8px;
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
      </style>
      
      <div id="speedy-floating-overlay" style="
        position: fixed;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        z-index: 999999;
        width: 600px;
        max-width: 90vw;
        max-height: 60vh;
        display: flex;
        flex-direction: column;
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        opacity: 0;
        pointer-events: none;
      ">
        <!-- Main Container -->
        <form id="speedy-form" action="javascript:void(0)" onsubmit="return false;" style="
          background: color-mix(in srgb, rgba(255, 255, 255, 0.08) 90%, transparent);
          backdrop-filter: blur(20px) saturate(1.05);
          -webkit-backdrop-filter: blur(20px) saturate(1.05);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: 10px 0px;
          display: flex;
          flex-direction: column;
          max-height: 60vh;
          transition: box-shadow 100ms ease-in-out, border-color 100ms ease-in-out, backdrop-filter 200ms ease-in-out;
          position: relative;
        ">
          <!-- Chat Messages List -->
          <div id="speedy-messages-list" style="
            display: none;
            flex-direction: column;
            overflow-y: auto;
            margin: 0px 10px 12px 10px;
            padding: 20px 20px 16px 20px;
            height: 250px;
            width: 100%;
            gap: 8px;
            position: relative;
          "></div>
          
          <!-- Context Pills Row -->
          <div style="
            align-items: center;
              display: flex;
              gap: 2px;
            width: 100%;
            flex-wrap: wrap;
            margin: 1px 10px 3px 10px;
          ">
            <!-- @ Button (Fixed Position) -->
            <div tabindex="0" id="speedy-at-button" style="
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
              padding: 0 5px;
              height: 22px;
              min-height: 22px;
              max-height: 22px;
              width: auto;
              box-sizing: border-box;
              border-radius: 5px;
              border: 1px solid rgba(228, 228, 228, 0.11);
              outline: none;
              flex-shrink: 0;
              background: transparent;
              transition-property: all;
              transition-duration: 0s;
              transition-timing-function: ease;
              user-select: none;
              font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              font-size: 11px;
              color: rgba(228, 228, 228, 0.55);
            ">
              <span style="font-size: 11px; color: rgba(228, 228, 228, 0.55); line-height: 22px;">@</span>
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
            padding: 0 12px 12px;
          ">
            <div style="
              display: flex;
              justify-content: center;
              transition: box-shadow 150ms ease-out;
              border-radius: 17px;
              padding: 5px;
              background: #ffffff;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              height: auto;
            ">
              <div style="width: 100%;">
                <div>
                  <div style="
                    max-height: 276px;
              overflow-y: auto;
                    opacity: 1;
                    height: auto;
                  " class="no-scrollbar">
                    <div id="speedy-tab-list" style="
                      padding-bottom: 6px;
                      display: flex;
                      flex-direction: column-reverse;
                    "></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Input Area -->
          <div style="
            position: relative;
            padding-top: 0px;
            cursor: text;
            gap: 0px;
            margin: 0px 10px;
          ">
            <div style="
              height: auto;
              min-height: 20px;
              width: 100%;
              max-height: 240px;
            ">
              <div contenteditable="true" 
                   id="speedy-input"
                   spellcheck="false"
                   data-placeholder="Plan, search, build anything"
                   style="
                     resize: none;
                     overflow: hidden;
                     line-height: 1.5;
                     font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                     font-size: 13px;
                     color: rgba(255, 255, 255, 0.9);
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
                     max-height: 204px;
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
            gap: 4px;
            flex-shrink: 0;
            cursor: auto;
            width: 100%;
            margin: 16px 10px 0px 10px;
            height: 28px;
          ">
            <!-- Left: Model Picker + Upload/Screenshot Buttons -->
            <div style="
              display: flex;
                  align-items: center;
                  gap: 8px;
              margin-right: 6px;
              flex-shrink: 1;
              flex-grow: 0;
              min-width: 0px;
              height: 20px;
            ">
              <div style="min-width: 0px; max-width: 100%; position: relative;">
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
              
              <!-- Image Upload Button -->
              <button type="button" id="speedy-image-upload" style="
                width: 18px;
                height: 18px;
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.9);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                transition: opacity 0.1s;
                flex-shrink: 0;
              " title="Upload image">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
              
              <!-- Screenshot Capture Button -->
              <button type="button" id="speedy-screenshot-capture" style="
                width: 18px;
                height: 18px;
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.9);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                transition: opacity 0.1s;
                flex-shrink: 0;
              " title="Capture screen">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              </div>
              
            <!-- Right: Submit Button -->
            <div style="display: flex; align-items: center; justify-content: flex-end;">
              <!-- Submit Button -->
              <button
                id="speedy-submit"
                type="submit"
                disabled
                style="
                  width: 20px;
                  height: 20px;
                  background: transparent;
                  border: none;
                  color: rgba(255, 255, 255, 0.5);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 0;
                  transition: opacity 0.1s;
                "
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            </div>
        </form>
      </div>
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
    const input = shadowRoot.getElementById('speedy-input');
    const button = shadowRoot.getElementById('speedy-submit');
    const form = shadowRoot.getElementById('speedy-form');
    const atButton = shadowRoot.getElementById('speedy-at-button');
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
    
    // State
    let message = '';
    let isVisible = false;
    let selectedTabs = [];
    let availableTabs = [];
    let selectedModel = 'anthropic/claude-3.5-sonnet';
    let availableModels = [];
    let modelsLoading = true;
    let currentChatId = null;
    let messages = [];
    let isStreaming = false;
    let capturedScreenshots = [];
    
    // Fallback models list (main models only)
    const fallbackModels = [
      'openai/gpt-4o',
      'openai/gpt-3.5-turbo',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'google/gemini-pro',
      'google/gemini-flash'
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
              position: absolute;
            }
          `;
          shadowRoot.appendChild(style);
          input.setAttribute('data-placeholder-added', 'true');
        }
      }
    }
    
    updatePlaceholder();
    
    // Fetch available models
    async function fetchModels() {
      try {
        const data = await apiRequest('GET', '/api/openrouter/models');
        
        if (data.data && Array.isArray(data.data)) {
          // Filter to only include main models from big 4 providers
          const mainModels = [
            // OpenAI - main models only
            'openai/gpt-4o',
            'openai/gpt-4o-mini',
            'openai/gpt-4-turbo',
            'openai/gpt-3.5-turbo',
            'openai/o1-mini',
            
            // Anthropic - main Claude models
            'anthropic/claude-3.5-sonnet',
            'anthropic/claude-3.5-haiku',
            'anthropic/claude-3-opus',
            'anthropic/claude-3-haiku',
            
            // Google - main Gemini models
            'google/gemini-2.5-flash',
            'google/gemini-pro',
            'google/gemini-flash',
            
            // X.AI - main Grok models
            'x-ai/grok-4',
            'x-ai/grok-4-fast'
          ];
          
          const filteredModels = data.data.filter(model => {
            return mainModels.includes(model.id);
          });
          
          // Sort models alphabetically by name within each provider
          availableModels = filteredModels.sort((a, b) => {
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
        if (name.includes('haiku')) return 'haiku';
        if (name.includes('opus')) return 'opus';
        if (name.includes('gpt-4')) return 'gpt-4';
        if (name.includes('gpt-3.5')) return 'gpt-3.5';
        if (name.includes('gemini')) return 'gemini';
        if (name.includes('llama')) return 'llama';
        return model.name;
      }
      // Format the ID nicely - extract last part
      const parts = modelId.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('sonnet')) return 'sonnet';
      if (lastPart.includes('haiku')) return 'haiku';
      if (lastPart.includes('opus')) return 'opus';
      if (lastPart.includes('gpt-4')) return 'gpt-4';
      if (lastPart.includes('gpt-3.5')) return 'gpt-3.5';
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
      
      // Get clean model name without provider prefix
      let displayName = model.name || model.id.split('/').pop();
      
      // Clean up the display name to be more readable
      displayName = displayName
        .replace(/^(gpt-|claude-|gemini-|grok-)/i, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
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
      `;
      
      button.textContent = displayName;
      
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
      modelMenu.style.display = 'block';
      modelChevron.style.transform = 'rotate(180deg)';
      modelSelector.style.background = 'rgba(255, 255, 255, 0.05)';
    }
    
    // ========== CHAT FUNCTIONS ==========
    
    async function ensureChat() {
      if (currentChatId) return currentChatId;
      
      try {
        const chat = await apiRequest('POST', '/api/chats', {
          title: 'Overlay Chat',
          model: selectedModel
        });
        currentChatId = chat._id;
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
    
    // Toggle overlay visibility
    function toggleOverlay() {
      isVisible = !isVisible;
      
      if (isVisible) {
        overlay.style.opacity = '1';
        overlay.style.transform = 'translateX(-50%) translateY(0)';
        overlay.style.pointerEvents = 'auto';
        
        loadAvailableTabs();
        
        setTimeout(() => {
          input.focus();
        }, 100);
      } else {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translateX(-50%) translateY(20px)';
        overlay.style.pointerEvents = 'none';
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
        type: 'SPEEDY_REQUEST_TABS'
      }, '*');
    }
    
    function addContextChip(tab, addFirst = false) {
      console.log('🔍 [Overlay] addContextChip called with tab:', {
        id: tab.id,
        title: tab.title,
        url: tab.url,
        hasFavIcon: !!tab.favIconUrl,
        favIconUrl: tab.favIconUrl,
        addFirst: addFirst
      });
      
      if (selectedTabs.find(t => t.id === tab.id)) return;
      
      // Add current tab first, others at the end
      if (addFirst) {
        selectedTabs.unshift(tab);
      } else {
        selectedTabs.push(tab);
      }
      
      // Create wrapper div (like Cursor's structure)
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        display: inline-flex;
        gap: 3px;
        align-items: center;
      `;
      
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
      
      // Create the actual pill
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
        gap: 3px;
        padding: 0 7px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.15);
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
      
      // Truncate title to 10-12 characters max
      const maxLength = 11;
      const titleText = tab.title.length > maxLength ? tab.title.substring(0, maxLength) : tab.title;
      const hasEllipsis = tab.title.length > maxLength;
      
      // Favicon already converted to data URL by background script
      const favicon = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>';
      console.log(`✅ [Overlay] Context chip favicon for tab ${tab.id}:`, favicon.substring(0, 50) + '...');
       
       chip.innerHTML = `
        <div style="width: 14px; margin-left: -3px; margin-right: -2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <img src="${favicon}" style="width: 11px; height: 11px; border-radius: 2px; object-fit: contain;" />
        </div>
        <div style="flex-shrink: 0; opacity: 1; color: rgba(255, 255, 255, 0.9); font-size: 11px; line-height: 22px; display: flex; align-items: baseline;">
          <span>${titleText}</span>${hasEllipsis ? '<span style="font-weight: 200; opacity: 0.7;">...</span>' : ''}
        </div>
         <button class="remove-chip" style="
          margin-left: 3px;
           padding: 0;
           background: none;
           border: none;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
          opacity: 0.5;
          transition: opacity 0.1s;
          width: 12px;
          height: 12px;
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.9);
        ">
          <svg width="9" height="9" viewBox="0 0 512 512" fill="currentColor" style="display: block;">
             <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"/>
           </svg>
         </button>
       `;
      
      // Keep chips permanently highlighted - no hover effects
      chip.style.background = 'rgba(255, 255, 255, 0.15)';
      chip.style.opacity = '1';
      
      // Show remove button on hover only
      chip.addEventListener('mouseenter', () => {
        const removeBtn = chip.querySelector('.remove-chip');
        if (removeBtn) removeBtn.style.opacity = '1';
      });
      
      chip.addEventListener('mouseleave', () => {
        const removeBtn = chip.querySelector('.remove-chip');
        if (removeBtn) removeBtn.style.opacity = '0.5';
      });
      
      chip.querySelector('.remove-chip').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedTabs = selectedTabs.filter(t => t.id !== tab.id);
        wrapper.remove();
        syncContextToContentScript();
      });
      
      pillContainer.appendChild(chip);
      wrapper.appendChild(pillContainer);
      
      // Insert at beginning if addFirst is true (for current tab), otherwise append
      if (addFirst && contextPills.firstChild) {
        contextPills.insertBefore(wrapper, contextPills.firstChild);
      } else {
        contextPills.appendChild(wrapper);
      }
      
      syncContextToContentScript();
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
        background: rgba(255, 255, 255, 0.15);
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
        <div style="width: 14px; margin-left: -3px; margin-right: -2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <img src="${screenshot.thumbnail}" style="width: 11px; height: 11px; border-radius: 2px; object-fit: cover;" />
        </div>
        <div style="flex-shrink: 0; opacity: 1; color: rgba(255, 255, 255, 0.9); font-size: 11px; line-height: 22px;">Screenshot</div>
        <button class="remove-chip" style="
          margin-left: 3px;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.5;
          transition: opacity 0.1s;
          width: 12px;
          height: 12px;
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.9);
        ">
          <svg width="9" height="9" viewBox="0 0 512 512" fill="currentColor" style="display: block;">
            <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"/>
          </svg>
        </button>
      `;
      
      // Keep chips permanently highlighted - no hover effects
      // Only show remove button on hover
      chip.addEventListener('mouseenter', () => {
        const removeBtn = chip.querySelector('.remove-chip');
        if (removeBtn) removeBtn.style.opacity = '1';
      });
      
      chip.addEventListener('mouseleave', () => {
        const removeBtn = chip.querySelector('.remove-chip');
        if (removeBtn) removeBtn.style.opacity = '0.5';
      });
      
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
    
    function renderTabList(tabs) {
      console.log('🔍 [Overlay] renderTabList called with tabs:', tabs);
      availableTabs = tabs;
      tabList.innerHTML = '';
      
      tabs.forEach((tab, index) => {
        console.log(`🔍 [Overlay] Processing tab ${index}:`, {
          id: tab.id,
          title: tab.title,
          url: tab.url,
          hasFavIcon: !!tab.favIconUrl,
          favIconUrl: tab.favIconUrl
        });
        
        const isSelected = selectedTabs.find(t => t.id === tab.id);
        
        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          position: relative;
           cursor: pointer;
          display: block;
          width: 100%;
          border-radius: 10px;
          transition: opacity 150ms;
          ${isSelected ? 'background: rgba(0, 0, 0, 0.05); opacity: 1;' : 'opacity: 0.8;'}
        `;
        
        // Create button
        const button = document.createElement('button');
        button.type = 'button';
        button.style.cssText = `
          display: block;
          width: 100%;
          text-align: left;
          padding: 6px 8px;
             font-size: 13px; 
           display: flex;
           align-items: center;
             overflow: hidden; 
             text-overflow: ellipsis; 
             white-space: nowrap;
          transition: colors 150ms;
          border-radius: 15px;
          border: none;
          background: transparent;
          cursor: pointer;
        `;
        
         const title = tab.title || 'Untitled';
        const displayTitle = title.length > 25 ? title.substring(0, 25) + '...' : title;
        const url = tab.url || '';
        const displayUrl = url.length > 40 ? url.substring(0, 40) + '...' : url;
        
        // Favicon already converted to data URL by background script
        const faviconUrl = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>';
        console.log(`✅ [Overlay] Tab menu favicon for tab ${tab.id}:`, faviconUrl.substring(0, 50) + '...');
        
        button.innerHTML = `
          <span style="
            margin-right: 6px;
                  flex-shrink: 0;
            width: 13px;
            height: 13px;
             display: flex;
             align-items: center;
             justify-content: center;
          ">
            <img alt="${title}" width="13" height="13" src="${faviconUrl}" style="object-fit: contain;" />
          </span>
           <div style="
            color: rgba(0, 0, 0, 0.85);
             overflow: hidden; 
             text-overflow: ellipsis; 
             white-space: nowrap;
             flex-shrink: 0;
          ">${displayTitle}</div>
          <div style="
            font-size: 13px;
            color: rgba(0, 0, 0, 0.3);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
             margin-left: 8px;
          ">${displayUrl}</div>
         `;
        
        // Hover effects
        wrapper.addEventListener('mouseenter', () => {
          if (!isSelected) {
            wrapper.style.opacity = '1';
            wrapper.style.background = 'rgba(0, 0, 0, 0.05)';
          }
        });
        
        wrapper.addEventListener('mouseleave', () => {
          if (!isSelected) {
            wrapper.style.opacity = '0.8';
            wrapper.style.background = 'transparent';
          }
        });
        
        // Click handler
        button.addEventListener('click', () => {
          if (isSelected) {
            selectedTabs = selectedTabs.filter(t => t.id !== tab.id);
            const chip = shadowRoot.querySelector(`[data-tab-id="${tab.id}"]`);
            if (chip) chip.remove();
          } else {
            addContextChip(tab);
          }
          
          renderTabList(availableTabs);
        });
        
        wrapper.appendChild(button);
        tabList.appendChild(wrapper);
      });
    }
    
    // Model Selector handler
    modelSelector.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (modelMenu.style.display === 'none' || !modelMenu.style.display) {
        openModelMenu();
        tabMenu.style.display = 'none';
      } else {
        closeModelMenu();
      }
    });
    
    
    // @ Button handler
    atButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      closeModelMenu();
      
      if (tabMenu.style.display === 'none' || !tabMenu.style.display) {
        tabMenu.style.display = 'block';
        atButton.style.background = 'rgba(255, 255, 255, 0.1)';
      } else {
        tabMenu.style.display = 'none';
        atButton.style.background = 'transparent';
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
    });
    
    input.addEventListener('keydown', (e) => {
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
          tabMenu.style.display = 'block';
          atButton.style.background = 'rgba(255, 255, 255, 0.1)';
        }, 0);
      }
    });
    
    input.addEventListener('keypress', (e) => {
      e.stopPropagation();
    });
    
    input.addEventListener('keyup', (e) => {
      e.stopPropagation();
    });
    
    input.addEventListener('focus', () => {
      form.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2)';
      closeModelMenu();
    });
    
    input.addEventListener('blur', () => {
      form.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)';
    });
    
    // Screenshot capture handler
    screenshotBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        const requestId = `screenshot_${Date.now()}`;
        
        // Listen for response
        const messageHandler = (event) => {
          if (event.source !== window) return;
          if (event.data.type === 'SPEEDY_SCREENSHOT_RESPONSE' && event.data.requestId === requestId) {
            window.removeEventListener('message', messageHandler);
            
            if (event.data.success && event.data.dataUrl) {
              // Add screenshot to captured list
              const screenshot = {
                id: `screenshot-${Date.now()}`,
                dataUrl: event.data.dataUrl,
                timestamp: new Date().toISOString(),
                thumbnail: event.data.dataUrl // We'll use same for now
              };
              
              capturedScreenshots.push(screenshot);
              
              // Add screenshot chip to context
              addScreenshotChip(screenshot);
              
              // Show notification
              showNotification('Screenshot captured!');
            } else {
              showNotification('Screenshot capture failed');
            }
          }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Send request to content script
        window.postMessage({
          type: 'SPEEDY_CAPTURE_SCREENSHOT',
          requestId
        }, '*');
        
        // Timeout after 5 seconds
        setTimeout(() => {
          window.removeEventListener('message', messageHandler);
        }, 5000);
      } catch (error) {
        console.error('Screenshot failed:', error);
        showNotification('Screenshot capture failed');
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
    
    
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!overlay.contains(e.target)) {
        closeModelMenu();
        tabMenu.style.display = 'none';
        atButton.style.background = 'transparent';
      }
    });
    
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
        
        // Automatically add the current tab FIRST in context pills
        const currentTab = tabs.find(tab => tab.active);
        if (currentTab && !selectedTabs.find(t => t.id === currentTab.id)) {
          console.log('🔍 [Overlay] Auto-adding current tab to context (as first):', currentTab.title);
          addContextChip(currentTab, true); // true = add first
        }
        
        renderTabList(tabs);
      }
    });
    
    // Initialize models
    fetchModels();
    
    console.log('✅ Speedy AI Overlay initialized');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOverlay);
  } else {
    setTimeout(initOverlay, 0);
  }
})();
