// Speedy AI Overlay - Cursor-Style Composer
(function() {
  'use strict';

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
          width: 8px;
        }
        
        #speedy-tab-menu::-webkit-scrollbar-track,
        #speedy-model-menu::-webkit-scrollbar-track {
          background: transparent;
        }
        
        #speedy-tab-menu::-webkit-scrollbar-thumb,
        #speedy-model-menu::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
        }
        
        #speedy-tab-menu::-webkit-scrollbar-thumb:hover,
        #speedy-model-menu::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
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
        #speedy-messages-container::-webkit-scrollbar {
          width: 6px;
        }
        
        #speedy-messages-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        #speedy-messages-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
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
        width: 500px;
        max-width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        opacity: 0;
        pointer-events: none;
      ">
        <!-- Main Container -->
        <form id="speedy-form" style="
          background: color-mix(in srgb, rgba(255, 255, 255, 0.08) 90%, transparent);
          backdrop-filter: blur(20px) saturate(1.05);
          -webkit-backdrop-filter: blur(20px) saturate(1.05);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: 10px;
          display: flex;
          flex-direction: column;
          max-height: 80vh;
          transition: box-shadow 100ms ease-in-out, border-color 100ms ease-in-out, backdrop-filter 200ms ease-in-out;
          position: relative;
        ">
          <!-- Chat Messages Container -->
          <div id="speedy-messages-container" style="
            display: none;
            flex-direction: column;
            overflow-y: auto;
            margin-bottom: 12px;
            background: rgba(11, 12, 16, 0.95);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            max-height: 500px;
          ">
            <div id="speedy-messages-list" style="
              display: flex;
              flex-direction: column;
              width: 100%;
              gap: 8px;
            "></div>
          </div>
          
          <!-- Context Pills Row -->
          <div style="
            align-items: center;
              display: flex;
              gap: 4px;
            width: 100%;
            flex-wrap: wrap;
            margin-bottom: 4px;
          ">
            <!-- @ Button (Fixed Position) -->
            <div tabindex="0" id="speedy-at-button" style="
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
              padding: 0 6px;
              height: 26px;
              min-height: 26px;
              max-height: 26px;
              width: auto;
              box-sizing: border-box;
              border-radius: 6px;
              border: 1px solid rgba(228, 228, 228, 0.11);
              outline: none;
              flex-shrink: 0;
              background: transparent;
              transition-property: all;
              transition-duration: 0s;
              transition-timing-function: ease;
              user-select: none;
              font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              font-size: 13px;
              color: rgba(228, 228, 228, 0.55);
            ">
              <span style="font-size: 13px; color: rgba(228, 228, 228, 0.55); line-height: 26px;">@</span>
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
                     max-height: 240px;
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
            margin-top: 16px;
            height: 28px;
          ">
            <!-- Left: Model Picker -->
            <div style="
              display: flex;
                  align-items: center;
                  gap: 4px;
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
                  <div style="padding: 8px 8px 4px; font-size: 11px; color: rgba(0,0,0,0.6); font-weight: 600; letter-spacing: 0.3px; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    BASIC
                  </div>
                  <div id="speedy-basic-models"></div>
                  
                  <div style="padding: 8px 8px 4px; font-size: 11px; color: rgba(0,0,0,0.6); font-weight: 600; letter-spacing: 0.3px; margin-top: 4px; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    ADVANCED
                  </div>
                  <div id="speedy-advanced-models"></div>
                  
                  <div style="height: 1px; background: rgba(0,0,0,0.1); margin: 8px 4px;"></div>
                  
                  <div id="speedy-other-models-btn" style="
                    padding: 5px 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: 8px;
                    transition: background 0.1s;
                  ">
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(0,0,0,0.85); font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                        <path fill="currentColor" d="M4 8a1.333 1.333 0 1 1-2.667 0A1.333 1.333 0 0 1 4 8m5.333 0a1.333 1.333 0 1 1-2.666 0 1.333 1.333 0 0 1 2.666 0m4 1.333a1.333 1.333 0 1 0 0-2.666 1.333 1.333 0 0 0 0 2.666"/>
                      </svg>
                      Other models
                    </div>
                    <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                      <path fill="currentColor" fill-rule="evenodd" d="M4.176 10.225a.6.6 0 0 0 .848 0l3.517-3.518a1 1 0 0 0 0-1.414L5.024 1.776a.6.6 0 1 0-.848.849L7.55 6 4.176 9.376a.6.6 0 0 0 0 .849" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  
                  <div id="speedy-all-models-section" style="display: none;">
                    <div style="position: sticky; top: 0; background: #fff; padding: 8px 0px; z-index: 1;">
                      <input id="speedy-model-search" placeholder="Search all models…" style="
                        width: 100%;
                        box-sizing: border-box;
                        padding: 8px 10px;
                        font-size: 13px;
                        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        border-radius: 8px;
                        border: 1px solid rgba(0,0,0,0.12);
                        outline: none;
                      "/>
                    </div>
                    <div id="speedy-all-models"></div>
                  </div>
                  </div>
                </div>
              </div>
              
            <!-- Right: Action Buttons -->
            <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end;">
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
              " title="Capture screen">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              
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

    // Create shadow DOM for style isolation
    const shadowRoot = container.attachShadow({ mode: 'open' });
    
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
    const modelSearch = shadowRoot.getElementById('speedy-model-search');
    const basicModelsContainer = shadowRoot.getElementById('speedy-basic-models');
    const advancedModelsContainer = shadowRoot.getElementById('speedy-advanced-models');
    const otherModelsBtn = shadowRoot.getElementById('speedy-other-models-btn');
    const allModelsContainer = shadowRoot.getElementById('speedy-all-models');
    const allModelsSection = shadowRoot.getElementById('speedy-all-models-section');
    const messagesContainer = shadowRoot.getElementById('speedy-messages-container');
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
    
    // Basic models (fast, everyday use)
    const basicModels = [
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo',
      'google/gemini-flash'
    ];
    
    // Advanced models (powerful, complex tasks)
    const advancedModels = [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4-turbo',
      'google/gemini-pro'
    ];
    
    // Placeholder handling for contenteditable
    function updatePlaceholder() {
      const placeholder = input.getAttribute('data-placeholder');
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
        const response = await fetch('http://localhost:3001/api/openrouter/models');
        const data = await response.json();
        
        if (data.data) {
          availableModels = data.data;
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        availableModels = popularModels.map(id => ({ 
          id, 
          name: id.split('/')[1] 
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
    function renderModels(searchQuery = '') {
      // If searching, show all models section
      if (searchQuery) {
        allModelsSection.style.display = 'block';
        otherModelsBtn.style.display = 'none';
        basicModelsContainer.parentElement.style.display = 'none';
        advancedModelsContainer.parentElement.style.display = 'none';
        
      allModelsContainer.innerHTML = '';
        const query = searchQuery.toLowerCase();
        
        const filteredModels = availableModels.filter(m => {
          const name = m.name || m.id;
          return name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query);
        }).slice(0, 30);
        
        filteredModels.forEach(model => {
          const modelButton = createModelButton(model);
          allModelsContainer.appendChild(modelButton);
        });
        return;
      }
      
      // Default view: show basic/advanced sections
      allModelsSection.style.display = 'none';
      otherModelsBtn.style.display = 'flex';
      basicModelsContainer.parentElement.style.display = 'block';
      advancedModelsContainer.parentElement.style.display = 'block';
      
      basicModelsContainer.innerHTML = '';
      advancedModelsContainer.innerHTML = '';
      
      // Render basic models
      basicModels.forEach(modelId => {
        const model = availableModels.find(m => m.id === modelId) || { 
          id: modelId, 
          name: modelId.split('/').pop() 
        };
        const modelButton = createModelButton(model);
        basicModelsContainer.appendChild(modelButton);
      });
      
      // Render advanced models
      advancedModels.forEach(modelId => {
        const model = availableModels.find(m => m.id === modelId) || { 
          id: modelId, 
          name: modelId.split('/').pop() 
        };
          const modelButton = createModelButton(model);
        advancedModelsContainer.appendChild(modelButton);
        });
    }
    
    // Create model button
    function createModelButton(model) {
      const button = document.createElement('button');
      button.type = 'button';
      const isSelected = selectedModel === model.id;
      
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
      `;
      
      button.innerHTML = `
        <div style="font-weight: ${isSelected ? '600' : '500'};">${model.name || model.id.split('/').pop()}</div>
        <div style="font-size: 11px; color: ${isSelected ? 'rgb(59, 130, 246)' : 'rgb(156, 163, 175)'}; margin-top: 2px;">${model.id}</div>
      `;
      
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
        renderModels(modelSearch.value);
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
      setTimeout(() => modelSearch.focus(), 50);
    }
    
    // ========== CHAT FUNCTIONS ==========
    
    async function ensureChat() {
      if (currentChatId) return currentChatId;
      
      try {
        const response = await fetch('http://localhost:3001/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Overlay Chat',
            model: selectedModel
          })
        });
        const chat = await response.json();
        currentChatId = chat._id;
        return currentChatId;
      } catch (error) {
        console.error('Error creating chat:', error);
        return null;
      }
    }
    
    function addMessageToUI(role, content, isStreaming = false) {
      if (messagesContainer.style.display === 'none') {
        messagesContainer.style.display = 'flex';
      }
      
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
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    async function sendMessageToAPI(messageText, contexts = []) {
      const chatId = await ensureChat();
      if (!chatId) {
        console.error('Failed to create chat');
        return;
      }
      
      addMessageToUI('user', messageText);
      
      await fetch(`http://localhost:3001/api/chats/${chatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'user',
          content: messageText,
          context: contexts
        })
      });
      
      const chatResponse = await fetch(`http://localhost:3001/api/chats/${chatId}`);
      const chatData = await chatResponse.json();
      
      const apiMessages = chatData.messages.map(msg => ({
        role: msg.role,
        content: buildMessageContent(msg.content, msg.context)
      }));
      
      isStreaming = true;
      const streamingMessageDiv = addMessageToUI('assistant', '', true);
      let fullResponse = '';
      
      try {
        const response = await fetch('http://localhost:3001/api/openrouter/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            model: selectedModel,
            stream: true
          })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullResponse += content;
                  updateStreamingMessage(streamingMessageDiv, fullResponse);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
        
        await fetch(`http://localhost:3001/api/chats/${chatId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'assistant',
            content: fullResponse,
            context: []
          })
        });
        
        streamingMessageDiv.classList.remove('speedy-message-streaming');
        
      } catch (error) {
        console.error('Error streaming response:', error);
        streamingMessageDiv.textContent = 'Error: Failed to get response';
      } finally {
        isStreaming = false;
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
    
    function addContextChip(tab) {
      console.log('🔍 [Overlay] addContextChip called with tab:', {
        id: tab.id,
        title: tab.title,
        url: tab.url,
        hasFavIcon: !!tab.favIconUrl,
        favIconUrl: tab.favIconUrl
      });
      
      if (selectedTabs.find(t => t.id === tab.id)) return;
      
      selectedTabs.push(tab);
      
      // Create wrapper div (like Cursor's structure)
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        display: inline-flex;
        gap: 4px;
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
        gap: 4px;
        padding: 0 8px;
        border-radius: 6px;
        background: transparent;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        line-height: 26px;
        color: rgba(228, 228, 228, 0.55);
        user-select: none;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: visible;
        box-sizing: border-box;
        height: 26px;
        min-height: 26px;
        max-height: 26px;
      `;
      
      // Truncate title to 10-12 characters max
      const maxLength = 11;
      const titleText = tab.title.length > maxLength ? tab.title.substring(0, maxLength) : tab.title;
      const hasEllipsis = tab.title.length > maxLength;
      
      // Favicon already converted to data URL by background script
      const favicon = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23666"/></svg>';
      console.log(`✅ [Overlay] Context chip favicon for tab ${tab.id}:`, favicon.substring(0, 50) + '...');
       
       chip.innerHTML = `
        <div style="width: 16px; margin-left: -4px; margin-right: -2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <img src="${favicon}" style="width: 13px; height: 13px; border-radius: 2px; object-fit: contain;" />
        </div>
        <div style="flex-shrink: 0; opacity: 1; color: rgba(255, 255, 255, 0.9); font-size: 13px; line-height: 26px; display: flex; align-items: baseline;">
          <span>${titleText}</span>${hasEllipsis ? '<span style="font-weight: 200; opacity: 0.7;">...</span>' : ''}
        </div>
         <button class="remove-chip" style="
          margin-left: 4px;
           padding: 0;
           background: none;
           border: none;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
          opacity: 0.5;
          transition: opacity 0.1s;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.9);
        ">
          <svg width="10" height="10" viewBox="0 0 512 512" fill="currentColor" style="display: block;">
             <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"/>
           </svg>
         </button>
       `;
      
      chip.addEventListener('mouseenter', () => {
        chip.style.background = 'rgba(255, 255, 255, 0.2)';
        chip.style.opacity = '1';
        const removeBtn = chip.querySelector('.remove-chip');
        if (removeBtn) removeBtn.style.opacity = '1';
      });
      
      chip.addEventListener('mouseleave', () => {
        chip.style.background = 'rgba(255, 255, 255, 0.1)';
        chip.style.opacity = '1';
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
      contextPills.appendChild(wrapper);
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
        gap: 4px;
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
        gap: 4px;
        padding: 0 8px;
        border-radius: 6px;
        background: transparent;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        line-height: 26px;
        color: rgba(228, 228, 228, 0.55);
        user-select: none;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: visible;
        box-sizing: border-box;
        height: 26px;
        min-height: 26px;
        max-height: 26px;
      `;
      
      chip.innerHTML = `
        <div style="width: 16px; margin-left: -4px; margin-right: -2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <img src="${screenshot.thumbnail}" style="width: 13px; height: 13px; border-radius: 2px; object-fit: cover;" />
        </div>
        <div style="flex-shrink: 0; opacity: 1; color: rgba(255, 255, 255, 0.9); font-size: 13px; line-height: 26px;">Screenshot</div>
        <button class="remove-chip" style="
          margin-left: 4px;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.5;
          transition: opacity 0.1s;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.9);
        ">
          <svg width="10" height="10" viewBox="0 0 512 512" fill="currentColor" style="display: block;">
            <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"/>
          </svg>
        </button>
      `;
      
      // Hover effects
      chip.addEventListener('mouseenter', () => {
        chip.style.background = 'rgba(255, 255, 255, 0.2)';
        chip.style.opacity = '1';
        const removeBtn = chip.querySelector('.remove-chip');
        if (removeBtn) removeBtn.style.opacity = '1';
      });
      
      chip.addEventListener('mouseleave', () => {
        chip.style.background = 'transparent';
        chip.style.opacity = '1';
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
    
    // Other models button handler
    otherModelsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      allModelsSection.style.display = 'block';
      otherModelsBtn.style.display = 'none';
      basicModelsContainer.parentElement.style.display = 'none';
      advancedModelsContainer.parentElement.style.display = 'none';
      
      // Render all models
      allModelsContainer.innerHTML = '';
      const allOtherModels = availableModels
        .filter(m => !basicModels.includes(m.id) && !advancedModels.includes(m.id))
        .slice(0, 30);
      
      allOtherModels.forEach(model => {
        const modelButton = createModelButton(model);
        allModelsContainer.appendChild(modelButton);
      });
      
      setTimeout(() => modelSearch.focus(), 50);
    });
    
    otherModelsBtn.addEventListener('mouseenter', () => {
      otherModelsBtn.style.background = 'rgba(0, 0, 0, 0.05)';
    });
    
    otherModelsBtn.addEventListener('mouseleave', () => {
      otherModelsBtn.style.background = 'transparent';
    });
    
    // Model search handler
    modelSearch.addEventListener('input', (e) => {
      renderModels(e.target.value);
    });
    
    modelSearch.addEventListener('keydown', (e) => {
      e.stopPropagation();
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
      message = input.textContent;
      button.disabled = !message.trim();
      
      if (message.trim()) {
        button.style.color = 'rgba(255, 255, 255, 1)';
      } else {
        button.style.color = 'rgba(255, 255, 255, 0.5)';
      }
      
      updatePlaceholder();
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
        // Send message to background script to capture screenshot
        chrome.runtime.sendMessage({
          type: 'CAPTURE_SCREENSHOT'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Screenshot capture error:', chrome.runtime.lastError);
            showNotification('Screenshot capture failed');
            return;
          }
          
          if (response && response.dataUrl) {
            // Add screenshot to captured list
            const screenshot = {
              id: `screenshot-${Date.now()}`,
              dataUrl: response.dataUrl,
              timestamp: new Date().toISOString(),
              thumbnail: response.dataUrl // We'll use same for now
            };
            
            capturedScreenshots.push(screenshot);
            
            // Add screenshot chip to context
            addScreenshotChip(screenshot);
            
            // Show notification
            showNotification('Screenshot captured!');
          }
        });
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
      
      if (!message.trim() || isStreaming) return;
      
      const messageToSend = message.trim();
      
      // Build context from tabs
      const contextsToSend = selectedTabs.map(tab => ({
        type: 'tab',
        data: {
          id: tab.id,
          title: tab.title,
          url: tab.url,
          content: '',
          favIconUrl: tab.favIconUrl
        }
      }));
      
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
      
      selectedTabs = [];
      capturedScreenshots = [];
      shadowRoot.querySelectorAll('.context-chip').forEach(chip => chip.remove());
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
        toggleOverlay();
      }
      
      if (event.data.type === 'SPEEDY_TABS_RESPONSE') {
        console.log('✅ [Overlay] Received SPEEDY_TABS_RESPONSE:', event.data);
        const tabs = event.data.tabs || [];
        console.log('📋 [Overlay] Tabs count:', tabs.length);
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
