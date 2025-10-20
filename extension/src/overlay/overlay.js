// Speedy AI Overlay - Vanilla JS implementation
(function() {
  'use strict';

  // Create the overlay HTML
  function createOverlay() {
    const overlayHTML = `
      <style>
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
        
        #speedy-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        #speedy-input::-webkit-input-placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        #speedy-input::-moz-placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        /* Message styles - Cluely Dark Theme */
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
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
        
        .speedy-message-assistant code {
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.95);
        }
        
        .speedy-message-assistant pre {
          background: rgba(26, 26, 28, 1);
          padding: 12px 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 8px 0;
        }
        
        .speedy-message-assistant pre code {
          background: transparent;
          padding: 0;
          color: rgba(255, 255, 255, 0.9);
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
        
        .speedy-loading-dots {
          display: flex;
          gap: 6px;
          align-items: center;
          padding: 8px 0;
        }
        
        .speedy-loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          animation: pulse 1s infinite;
        }
        
        .speedy-loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .speedy-loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
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
        <!-- Main Container with Glassmorphism Bubble -->
        <form id="speedy-form" style="
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 0px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: 10px;
          display: flex;
          flex-direction: column;
          max-height: 80vh;
          transition: border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        ">
          <!-- Chat Messages Container - Only shows when messages exist -->
          <div id="speedy-messages-container" style="
            display: none;
            flex-direction: column;
            overflow-y: auto;
            margin-bottom: 12px;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 0px;
            padding: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.12);
            max-height: 500px;
          ">
            <div id="speedy-messages-list" style="
              display: flex;
              flex-direction: column;
              width: 100%;
              gap: 8px;
            "></div>
          </div>
            <!-- Sources/Context Section (Top) -->
            <div id="speedy-context-chips" style="
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
              margin-bottom: 8px;
              font-size: 13px;
            ">
              <!-- @ Button -->
              <button type="button" id="speedy-at-button" style="
                height: 26px;
                width: 26px;
                font-size: 12px;
                border-radius: 0px;
                border: none;
                background: transparent;
                opacity: 0.8;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.075s;
                padding: 0;
              ">
                <span style="font-weight: bold; color: rgba(255, 255, 255, 0.9);">@</span>
              </button>
              <!-- Context chips will be added here dynamically -->
            </div>
            
            <!-- Tab Selection Menu (Hidden by default) -->
            <div id="speedy-tab-menu" style="
              display: none;
              position: absolute;
              bottom: 100%;
              left: 0;
              right: 0;
              margin-bottom: 8px;
              background: rgba(255, 255, 255, 1);
              backdrop-filter: none;
              -webkit-backdrop-filter: none;
              border-radius: 12px;
              border: none;
              box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 24px, rgba(0, 0, 0, 0.05) 0px 2px 8px;
              max-height: 300px;
              overflow-y: auto;
              padding: 8px;
              isolation: isolate;
            ">
              <div style="padding: 8px 8px 4px; font-size: 12px; color: rgba(0,0,0,0.6); font-weight: 600; letter-spacing: 0.3px;">
                SELECT TABS TO ADD AS CONTEXT
              </div>
              <div id="speedy-tab-list"></div>
            </div>
            
            <!-- Text Input Section (Middle) -->
            <div style="
              min-height: 40px;
              max-height: 200px;
              margin-bottom: 8px;
            ">
              <textarea 
                id="speedy-input"
                placeholder="type @ for context, / for actions..."
                aria-label="Message Speedy AI"
                style="
                  width: 100%;
                  min-height: 40px;
                  max-height: 200px;
                  padding: 0;
                  background: transparent;
                  border: none;
                  outline: none;
                  font-size: 14px;
                  color: #ffffff;
                  resize: none;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                  overflow-y: auto;
                  box-sizing: border-box;
                "
              ></textarea>
            </div>
            
            <!-- Bottom Row: Action Buttons on Left, Model Picker + Send on Right -->
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
            ">
              <!-- Left Side: Action Buttons -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <!-- File Picker Button -->
                <button type="button" id="speedy-file-picker" style="
                  width: 30px;
                  height: 30px;
                  border-radius: 0px;
                  border: none;
                  background: transparent;
                  color: rgba(255, 255, 255, 0.8);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 0.075s;
                  opacity: 0.8;
                " title="Upload files">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                
                <!-- Screenshot Button -->
                <button type="button" id="speedy-screenshot" style="
                  width: 30px;
                  height: 30px;
                  border-radius: 0px;
                  border: none;
                  background: transparent;
                  color: rgba(255, 255, 255, 0.8);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 0.075s;
                  opacity: 0.8;
                " title="Capture screen">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </button>
              </div>
              
              <!-- Right Side: Model Picker + Submit Button -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <!-- Model Selector -->
                <div id="speedy-model-selector-container" style="position: relative; flex-shrink: 0;">
                  <button type="button" id="speedy-model-selector" style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    height: 30px;
                    padding: 0 10px;
                    font-size: 12px;
                    border-radius: 0px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.8);
                    cursor: pointer;
                    transition: all 0.075s;
                    white-space: nowrap;
                    opacity: 0.8;
                  ">
                    <span id="speedy-model-name" style="font-size: 12px; line-height: 14px;">haiku</span>
                    <svg id="speedy-model-chevron" style="width: 14px; height: 14px; opacity: 0.75; transition: transform 0.2s;" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M14.128 7.16482C14.3126 6.95983 14.6298 6.94336 14.835 7.12771C15.0402 7.31242 15.0567 7.62952 14.8721 7.83477L10.372 12.835L10.2939 12.9053C10.2093 12.9667 10.1063 13 9.99995 13C9.85833 12.9999 9.72264 12.9402 9.62788 12.835L5.12778 7.83477L5.0682 7.75273C4.95072 7.55225 4.98544 7.28926 5.16489 7.12771C5.34445 6.96617 5.60969 6.95939 5.79674 7.09744L5.87193 7.16482L9.99995 11.7519L14.128 7.16482Z"/>
                    </svg>
                  </button>
                  
                  <!-- Model Dropdown Menu -->
                  <div id="speedy-model-menu" style="
                    display: none;
                    position: absolute;
                    bottom: 100%;
                    right: 0;
                    margin-bottom: 8px;
                    background: rgba(255, 255, 255, 1);
                    border-radius: 12px;
                    box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 24px, rgba(0, 0, 0, 0.05) 0px 2px 8px;
                    max-height: 350px;
                    overflow-y: auto;
                    padding: 8px;
                    z-index: 1000;
                    min-width: 280px;
                  ">
                    <div style="position: sticky; top: 0; background: #fff; padding: 4px 8px 8px; z-index: 1;">
                      <input id="speedy-model-search" placeholder="Search models…" style="
                        width: 100%;
                        box-sizing: border-box;
                        padding: 8px 10px;
                        font-size: 13px;
                        border-radius: 8px;
                        border: 1px solid rgba(0,0,0,0.12);
                        outline: none;
                      "/>
                    </div>
                    <div style="padding: 8px 8px 4px; font-size: 11px; color: rgba(0,0,0,0.6); font-weight: 600; letter-spacing: 0.3px;">
                      POPULAR MODELS
                    </div>
                    <div id="speedy-popular-models"></div>
                    
                    <div id="speedy-all-models-section" style="display: none;">
                      <div style="border-top: 1px solid rgba(0,0,0,0.1); margin: 8px 0;"></div>
                      <div style="padding: 8px 8px 4px; font-size: 11px; color: rgba(0,0,0,0.6); font-weight: 600; letter-spacing: 0.3px;">
                        ALL MODELS
                      </div>
                      <div id="speedy-all-models"></div>
                    </div>
                  </div>
                </div>
                
                <!-- Submit Button -->
                <button
                id="speedy-submit"
                type="submit"
                disabled
                aria-label="Send prompt to Speedy AI"
                style="
                  width: 30px;
                  height: 30px;
                  border-radius: 0px;
                  border: none;
                  background: rgba(31, 78, 243, 0.9);
                  color: rgba(255, 255, 255, 1);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                  transition: all 0.2s;
                  padding: 0;
                  opacity: 0.95;
                  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.10);
                "
              >
                <svg width="14" height="14" viewBox="0 0 384 512" fill="currentColor">
                  <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
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
    const contextChips = shadowRoot.getElementById('speedy-context-chips');
    const modelSelector = shadowRoot.getElementById('speedy-model-selector');
    const modelMenu = shadowRoot.getElementById('speedy-model-menu');
    const modelName = shadowRoot.getElementById('speedy-model-name');
    const modelChevron = shadowRoot.getElementById('speedy-model-chevron');
    const popularModelsContainer = shadowRoot.getElementById('speedy-popular-models');
    const allModelsContainer = shadowRoot.getElementById('speedy-all-models');
    const allModelsSection = shadowRoot.getElementById('speedy-all-models-section');
    const messagesContainer = shadowRoot.getElementById('speedy-messages-container');
    const messagesList = shadowRoot.getElementById('speedy-messages-list');
    
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
    
    // Popular models to show first
    const popularModels = [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
      'google/gemini-pro',
      'meta-llama/llama-3-70b-instruct'
    ];
    
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
        // Set default models if fetch fails
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
      let name = model?.name || modelId.split('/').pop();
      
      // Extract just the model name - no company, lowercase
      name = name
        // Claude models
        .replace(/^.*claude.*3\.5.*sonnet.*/i, 'sonnet')
        .replace(/^.*claude.*3\.5.*haiku.*/i, 'haiku')
        .replace(/^.*claude.*3.*opus.*/i, 'opus')
        .replace(/^.*claude.*sonnet.*/i, 'sonnet')
        .replace(/^.*claude.*haiku.*/i, 'haiku')
        .replace(/^.*claude.*opus.*/i, 'opus')
        // OpenAI models
        .replace(/^.*gpt-4o.*/i, '4o')
        .replace(/^.*gpt-4.*turbo.*/i, '4-turbo')
        .replace(/^.*gpt-4.*/i, '4')
        .replace(/^.*gpt-3\.5.*/i, '3.5')
        .replace(/^.*o1-preview.*/i, 'o1-preview')
        .replace(/^.*o1-mini.*/i, 'o1-mini')
        // Google models
        .replace(/^.*gemini.*pro.*/i, 'gemini-pro')
        .replace(/^.*gemini.*flash.*/i, 'gemini-flash')
        .replace(/^.*gemini.*/i, 'gemini')
        // Meta models
        .replace(/^.*llama.*3.*70b.*/i, 'llama-70b')
        .replace(/^.*llama.*3.*8b.*/i, 'llama-8b')
        .replace(/^.*llama.*/i, 'llama')
        // Anthropic, OpenAI, Google, Meta prefixes
        .replace(/^(anthropic|openai|google|meta)[\/:\s-]+/i, '')
        // Remove company names anywhere
        .replace(/anthropic/gi, '')
        .replace(/openai/gi, '')
        .replace(/google/gi, '')
        .replace(/meta/gi, '')
        // Clean up
        .replace(/\(.*?\)/g, '') // Remove anything in parentheses
        .replace(/\d{4}-\d{2}-\d{2}/g, '') // Remove dates
        .replace(/^[\/:\s-]+/, '') // Remove leading separators
        .replace(/[\/:\s-]+$/, '') // Remove trailing separators
        .toLowerCase()
        .trim();
      
      return name || 'model';
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
      // Clear containers
      popularModelsContainer.innerHTML = '';
      allModelsContainer.innerHTML = '';
      
      // Render popular models
      popularModels.forEach(modelId => {
        const model = availableModels.find(m => m.id === modelId) || { 
          id: modelId, 
          name: modelId.split('/').pop() 
        };
        const modelButton = createModelButton(model);
        popularModelsContainer.appendChild(modelButton);
      });
      
      // Render other models
      const otherModels = availableModels
        .filter(m => !popularModels.includes(m.id))
        .slice(0, 20); // Limit to 20 additional models
      
      if (otherModels.length > 0) {
        allModelsSection.style.display = 'block';
        otherModels.forEach(model => {
          const modelButton = createModelButton(model);
          allModelsContainer.appendChild(modelButton);
        });
      }
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
        renderModels();
        modelMenu.style.display = 'none';
        modelChevron.style.transform = 'rotate(0deg)';
        modelSelector.style.background = 'rgba(255, 255, 255, 0.15)';
        modelSelector.style.opacity = '0.9';
      });
      
      return button;
    }
    
    // ========== CHAT FUNCTIONS ==========
    
    // Create or load chat
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
    
    // Add message to UI - Cluely Style
    function addMessageToUI(role, content, isStreaming = false) {
      // Show messages container when first message is added
      const messagesContainer = shadowRoot.getElementById('speedy-messages-container');
      if (messagesContainer.style.display === 'none') {
        messagesContainer.style.display = 'flex';
      }
      
      // Remove welcome message if it exists
      const welcomeMessage = messagesList.querySelector('.speedy-message-wrapper.assistant');
      if (welcomeMessage && welcomeMessage.querySelector('[style*="text-align: center"]')) {
        welcomeMessage.remove();
      }
      
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = `speedy-message-wrapper ${role}`;
      
      // Create content container
      const contentContainer = document.createElement('div');
      contentContainer.className = 'speedy-message-content';
      
      // Create message bubble
      const messageDiv = document.createElement('div');
      messageDiv.className = `speedy-message speedy-message-${role}`;
      if (isStreaming) {
        messageDiv.classList.add('speedy-message-streaming');
      }
      
      // Format content with basic markdown-like support
      messageDiv.innerHTML = formatMessage(content, role);
      
      // Create timestamp
      const timestamp = document.createElement('span');
      timestamp.className = 'speedy-message-timestamp';
      const now = new Date();
      timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Assemble structure
      contentContainer.appendChild(messageDiv);
      contentContainer.appendChild(timestamp);
      wrapper.appendChild(contentContainer);
      
      messagesList.appendChild(wrapper);
      scrollToBottom();
      
      return messageDiv;
    }
    
    // Format message with basic markdown-like support
    function formatMessage(content, role) {
      if (!content) return '';
      
      // Only format assistant messages
      if (role === 'user') {
        return escapeHtml(content);
      }
      
      let formatted = escapeHtml(content);
      
      // Format inline code: `code`
      formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
      
      // Format code blocks: ```code```
      formatted = formatted.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
      
      // Format bold: **text** or __text__
      formatted = formatted.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');
      
      return formatted;
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Update streaming message
    function updateStreamingMessage(messageDiv, content) {
      // Get the role from the message class
      const role = messageDiv.classList.contains('speedy-message-user') ? 'user' : 'assistant';
      messageDiv.innerHTML = formatMessage(content, role);
      scrollToBottom();
    }
    
    // Scroll to bottom of messages
    function scrollToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Welcome message removed - clean start
    
    // Send message and get response
    async function sendMessageToAPI(messageText, contexts = []) {
      const chatId = await ensureChat();
      if (!chatId) {
        console.error('Failed to create chat');
        return;
      }
      
      // Add user message to UI
      addMessageToUI('user', messageText);
      
      // Add user message to API
      await fetch(`http://localhost:3001/api/chats/${chatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'user',
          content: messageText,
          context: contexts
        })
      });
      
      // Get chat to build message history
      const chatResponse = await fetch(`http://localhost:3001/api/chats/${chatId}`);
      const chatData = await chatResponse.json();
      
      // Build messages with context
      const apiMessages = chatData.messages.map(msg => ({
        role: msg.role,
        content: buildMessageContent(msg.content, msg.context)
      }));
      
      // Stream AI response
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
        
        // Save assistant response
        await fetch(`http://localhost:3001/api/chats/${chatId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'assistant',
            content: fullResponse,
            context: []
          })
        });
        
        // Remove streaming class
        streamingMessageDiv.classList.remove('speedy-message-streaming');
        
      } catch (error) {
        console.error('Error streaming response:', error);
        streamingMessageDiv.textContent = 'Error: Failed to get response';
      } finally {
        isStreaming = false;
      }
    }
    
    // Build message content with context
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
        
        // Load available tabs
        loadAvailableTabs();
        
        // Focus the input when showing - try multiple times to ensure it works
        setTimeout(() => {
          input.focus();
          input.click(); // Also trigger click to ensure focus
        }, 100);
        
        // Backup focus attempt
        setTimeout(() => {
          if (document.activeElement !== input) {
            input.focus();
          }
        }, 300);
      } else {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translateX(-50%) translateY(20px)';
        overlay.style.pointerEvents = 'none';
        tabMenu.style.display = 'none';
        modelMenu.style.display = 'none';
        
        // Clear the input when hiding
        input.value = '';
        message = '';
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.color = 'rgba(255, 255, 255, 0.5)';
      }
    }
    
    // Load available tabs
    async function loadAvailableTabs() {
      // Request tabs from content script
      window.postMessage({
        type: 'SPEEDY_REQUEST_TABS'
      }, '*');
    }
    
    // Add context chip for selected tab
    function addContextChip(tab) {
      if (selectedTabs.find(t => t.id === tab.id)) return;
      
      selectedTabs.push(tab);
      
      const chip = document.createElement('div');
      chip.className = 'context-chip';
      chip.dataset.tabId = tab.id;
      chip.style.cssText = `
        display: inline-flex;
        align-items: center;
        height: 26px;
        padding: 0 6px;
        font-size: 13px;
        background: rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.9);
        opacity: 0.8;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.075s;
        position: relative;
        gap: 0;
      `;
      
       const title = tab.title.length > 20 ? tab.title.substring(0, 20) + '...' : tab.title;
       const favicon = tab.favIconUrl;
       
       chip.innerHTML = `
         ${favicon ? `<img src="${favicon}" onerror="this.src=''; this.style.width='0'; this.style.marginRight='0';" style="width: 13px; height: 13px; flex-shrink: 0; border-radius: 2px; margin-right: 4px;" />` : ''}
         <span style="line-height: 1; font-size: 13px; color: rgba(255, 255, 255, 0.9);">${title}</span>
         <button class="remove-chip" style="
           margin-left: 4px;
           padding: 0;
           background: none;
           border: none;
           cursor: pointer;
           display: flex;
           align-items: center;
           justify-content: center;
           opacity: 0.4;
           transition: opacity 0.075s;
           width: 14px;
           height: 14px;
         ">
           <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor" style="display: block;">
             <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"/>
           </svg>
         </button>
       `;
      
      // Hover effect for chip
      chip.addEventListener('mouseenter', () => {
        chip.style.background = 'rgba(255, 255, 255, 0.25)';
        chip.style.opacity = '1';
        const removeBtn = chip.querySelector('.remove-chip');
        if (removeBtn) removeBtn.style.opacity = '0.8';
      });
      
      chip.addEventListener('mouseleave', () => {
        chip.style.background = 'rgba(255, 255, 255, 0.15)';
        chip.style.opacity = '0.8';
        const removeBtn = chip.querySelector('.remove-chip');
        if (removeBtn) removeBtn.style.opacity = '0.4';
      });
      
      // Remove chip handler
      chip.querySelector('.remove-chip').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedTabs = selectedTabs.filter(t => t.id !== tab.id);
        chip.remove();
        syncContextToContentScript();
      });
      
      chip.querySelector('.remove-chip').addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        e.target.style.opacity = '1';
      });
      
      // Insert before @ button
      contextChips.insertBefore(chip, atButton);
      
      // Sync context to content script
      syncContextToContentScript();
    }
    
    // Sync selected tabs to content script
    function syncContextToContentScript() {
      window.postMessage({
        type: 'SPEEDY_CONTEXT_CHANGED',
        selectedTabs: selectedTabs
      }, '*');
    }
    
    // Render tab list
    function renderTabList(tabs) {
      availableTabs = tabs;
      tabList.innerHTML = '';
      
      tabs.forEach(tab => {
         const tabItem = document.createElement('div');
         tabItem.style.cssText = `
           padding: 8px 10px;
           margin: 1px 0;
           border-radius: 8px;
           cursor: pointer;
           transition: background 0.1s, border-color 0.1s;
           display: flex;
           align-items: center;
           gap: 0;
           border: 1px solid transparent;
           background: rgba(255, 255, 255, 1);
         `;
        
        const isSelected = selectedTabs.find(t => t.id === tab.id);
        if (isSelected) {
          tabItem.style.background = 'rgba(248, 248, 248, 1)';
          tabItem.style.borderColor = 'rgba(0, 0, 0, 0.15)';
        }
        
         const title = tab.title || 'Untitled';
         const displayTitle = title.length > 60 ? title.substring(0, 60) + '...' : title;
         const favicon = tab.favIconUrl;
         
         tabItem.innerHTML = `
           ${favicon ? `<img src="${favicon}" 
                onerror="this.src=''; this.style.width='0'; this.style.marginRight='0';" 
                style="
                  width: 16px;
                  height: 16px;
                  flex-shrink: 0;
                  border-radius: 2px;
                  margin-right: 8px;
                "
           />` : ''}
           <div style="
             flex: 1; 
             font-size: 13px; 
             color: #000;
             font-weight: 500;
             overflow: hidden; 
             text-overflow: ellipsis; 
             white-space: nowrap;
             line-height: 1.3;
           ">
             ${displayTitle}
           </div>
           <div style="
             width: 18px;
             height: 18px;
             border-radius: 4px;
             background: ${isSelected ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0,0,0,0.08)'};
             border: ${isSelected ? 'none' : '1.5px solid rgba(0,0,0,0.15)'};
             display: flex;
             align-items: center;
             justify-content: center;
             flex-shrink: 0;
             transition: all 0.1s;
             margin-left: 8px;
           ">
             ${isSelected ? '<span style="color: white; font-size: 11px; font-weight: 600;">✓</span>' : ''}
           </div>
         `;
        
        tabItem.addEventListener('mouseenter', () => {
          if (!isSelected) {
            tabItem.style.background = 'rgba(245, 245, 245, 1)';
            tabItem.style.borderColor = 'rgba(0, 0, 0, 0.08)';
          } else {
            tabItem.style.background = 'rgba(240, 240, 240, 1)';
          }
        });
        
        tabItem.addEventListener('mouseleave', () => {
          if (!isSelected) {
            tabItem.style.background = 'rgba(255, 255, 255, 1)';
            tabItem.style.borderColor = 'transparent';
          } else {
            tabItem.style.background = 'rgba(248, 248, 248, 1)';
            tabItem.style.borderColor = 'rgba(0, 0, 0, 0.15)';
          }
        });
        
        tabItem.addEventListener('click', () => {
          if (isSelected) {
            // Remove tab
            selectedTabs = selectedTabs.filter(t => t.id !== tab.id);
            const chip = shadowRoot.querySelector(`[data-tab-id="${tab.id}"]`);
            if (chip) chip.remove();
          } else {
            // Add tab
            addContextChip(tab);
          }
          
          // Re-render tab list
          renderTabList(availableTabs);
        });
        
        tabList.appendChild(tabItem);
      });
    }
    
    // Model Selector Button handler
    modelSelector.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Toggle model menu
      if (modelMenu.style.display === 'none' || !modelMenu.style.display) {
        modelMenu.style.display = 'block';
        modelChevron.style.transform = 'rotate(180deg)';
        modelSelector.style.background = 'rgba(255, 255, 255, 0.1)';
        modelSelector.style.color = 'rgba(255, 255, 255, 0.9)';
      } else {
        modelMenu.style.display = 'none';
        modelChevron.style.transform = 'rotate(0deg)';
        modelSelector.style.background = 'transparent';
        modelSelector.style.color = 'rgba(255, 255, 255, 0.7)';
      }
    });
    
    // Model selector hover effects
    modelSelector.addEventListener('mouseenter', () => {
      if (modelMenu.style.display !== 'block') {
        modelSelector.style.background = 'rgba(255, 255, 255, 0.05)';
        modelSelector.style.color = 'rgba(255, 255, 255, 0.85)';
      }
    });
    
    modelSelector.addEventListener('mouseleave', () => {
      if (modelMenu.style.display !== 'block') {
        modelSelector.style.background = 'transparent';
        modelSelector.style.color = 'rgba(255, 255, 255, 0.7)';
      }
    });
    
    // @ Button handler
    atButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Close model menu if open
      if (modelMenu.style.display === 'block') {
        modelMenu.style.display = 'none';
        modelChevron.style.transform = 'rotate(0deg)';
        modelSelector.style.background = 'rgba(255, 255, 255, 0.15)';
        modelSelector.style.opacity = '0.9';
      }
      
      // Toggle tab menu
      if (tabMenu.style.display === 'none' || !tabMenu.style.display) {
        tabMenu.style.display = 'block';
        atButton.style.background = 'rgba(255, 255, 255, 0.25)';
        atButton.style.opacity = '1';
      } else {
        tabMenu.style.display = 'none';
        atButton.style.background = 'rgba(255, 255, 255, 0.15)';
        atButton.style.opacity = '0.8';
      }
    });
    
    // Ensure input is clickable and focusable
    input.addEventListener('click', (e) => {
      e.stopPropagation();
      input.focus();
    });
    
    input.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    
    // Input handlers
    input.addEventListener('input', (e) => {
      message = e.target.value;
      button.disabled = !message.trim();
      
      if (message.trim()) {
        button.style.opacity = '1';
        button.style.color = 'rgba(255, 255, 255, 1)';
      } else {
        button.style.opacity = '0.6';
        button.style.color = 'rgba(255, 255, 255, 0.5)';
      }
      
      // Auto-resize textarea
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 200) + 'px';
      
      // Notify content script of message change via postMessage
      window.postMessage({
        type: 'SPEEDY_OVERLAY_MESSAGE_CHANGE',
        message: message
      }, '*');
    });
    
    // Focus handler
    input.addEventListener('focus', () => {
      form.style.boxShadow = '0 10px 14px 0 rgba(0, 0, 0, 0.12)';
      
      // Close model menu when focusing input
      if (modelMenu.style.display === 'block') {
        modelMenu.style.display = 'none';
        modelChevron.style.transform = 'rotate(0deg)';
        modelSelector.style.background = 'rgba(255, 255, 255, 0.15)';
        modelSelector.style.opacity = '0.9';
      }
    });
    
    // Blur handler
    input.addEventListener('blur', () => {
      form.style.boxShadow = 'rgba(0, 0, 0, 0.06) 0px 7px 12px 0px';
      
      // Close tab menu when blurring (with small delay)
      setTimeout(() => {
        if (!tabMenu.matches(':hover')) {
          tabMenu.style.display = 'none';
          atButton.style.background = 'rgba(255, 255, 255, 0.15)';
          atButton.style.opacity = '0.8';
        }
      }, 200);
    });
    
    // Ensure form area is clickable
    form.addEventListener('click', (e) => {
      // If clicking on the form but not on buttons, focus the input
      if (e.target === form || e.target.closest('#speedy-input')) {
        input.focus();
      }
    });
    
    // Form submit handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!message.trim() || isStreaming) return;
      
      const messageToSend = message.trim();
      const contextsToSend = selectedTabs.map(tab => ({
        type: 'tab',
        data: {
          id: tab.id,
          title: tab.title,
          url: tab.url,
          content: '', // Will be extracted by API
          favIconUrl: tab.favIconUrl
        }
      }));
      
      // Add user message immediately
      addMessageToUI('user', messageToSend);
      
      // Clear input and UI
      message = '';
      input.value = '';
      input.style.height = 'auto';
      button.disabled = true;
      button.style.opacity = '0.6';
      button.style.color = 'rgba(255, 255, 255, 0.5)';
      
      // Clear selected tabs
      selectedTabs = [];
      shadowRoot.querySelectorAll('.context-chip').forEach(chip => chip.remove());
      
      // Send message to API and stream response
      try {
        await sendMessageToAPI(messageToSend, contextsToSend);
      } catch (error) {
        console.error('Error sending message:', error);
        // Show simulated response instead of error
        isStreaming = true;
        const streamingMessageDiv = addMessageToUI('assistant', '', true);
        
        // Simulate streaming response
        const simulatedResponse = "I'm a simulated response since the backend isn't connected. Your message was: **" + messageToSend + "**\n\nTo connect to the real AI, make sure your API server is running on `http://localhost:3001`";
        let currentText = '';
        
        for (let i = 0; i < simulatedResponse.length; i++) {
          currentText += simulatedResponse[i];
          updateStreamingMessage(streamingMessageDiv, currentText);
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        streamingMessageDiv.classList.remove('speedy-message-streaming');
        isStreaming = false;
      }
    });
    
    // Show notification function
    function showNotification(text, duration = 3000) {
      // Create notification element
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 999998;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      `;
      notification.textContent = text;
      
      shadowRoot.appendChild(notification);
      
      // Fade in
      setTimeout(() => {
        notification.style.opacity = '1';
      }, 10);
      
      // Fade out and remove
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, duration);
    }
    
    // Handle keyboard events and prevent them from bubbling to the page
    input.addEventListener('keydown', (e) => {
      // Stop propagation to prevent page shortcuts from triggering
      e.stopPropagation();
      
      if (e.key === 'Escape' && isVisible) {
        e.preventDefault();
        toggleOverlay();
        return;
      }
      
      // Handle @ key to open tab menu
      if (e.key === '@' && !tabMenu.style.display) {
        setTimeout(() => {
          tabMenu.style.display = 'block';
          atButton.style.background = 'rgba(255, 255, 255, 0.25)';
          atButton.style.opacity = '1';
        }, 0);
      }
    });
    
    // Also prevent keypress and keyup from bubbling
    input.addEventListener('keypress', (e) => {
      e.stopPropagation();
    });
    
    input.addEventListener('keyup', (e) => {
      e.stopPropagation();
    });
    
    // Listen for state changes from content script via postMessage
    window.addEventListener('message', (event) => {
      // Only accept messages from same origin
      if (event.source !== window) return;
      
      if (event.data.type === 'SPEEDY_STATE_CHANGED') {
        const { currentMessage } = event.data.data || {};
        if (currentMessage !== undefined) {
          input.value = currentMessage;
          message = currentMessage;
          button.disabled = !currentMessage.trim();
          
          if (currentMessage.trim()) {
            button.style.opacity = '1';
            button.style.color = 'rgba(255, 255, 255, 1)';
          } else {
            button.style.opacity = '0.6';
            button.style.color = 'rgba(255, 255, 255, 0.5)';
          }
          
          // Auto-resize textarea
          input.style.height = 'auto';
          input.style.height = Math.min(input.scrollHeight, 200) + 'px';
        }
      }
      
      if (event.data.type === 'SPEEDY_UPDATE_OVERLAY_MESSAGE') {
        input.value = event.data.message || '';
        message = event.data.message || '';
        button.disabled = !message.trim();
        
        if (message.trim()) {
          button.style.opacity = '1';
          button.style.color = 'rgba(255, 255, 255, 1)';
        } else {
          button.style.opacity = '0.6';
          button.style.color = 'rgba(255, 255, 255, 0.5)';
        }
        
        // Auto-resize textarea
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 200) + 'px';
      }
      
      // Handle toggle overlay command
      if (event.data.type === 'SPEEDY_TOGGLE_OVERLAY') {
        toggleOverlay();
      }
      
      // Handle tabs response from content script
      if (event.data.type === 'SPEEDY_TABS_RESPONSE') {
        const tabs = event.data.tabs || [];
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
    // DOM is already ready
    setTimeout(initOverlay, 0);
  }
})();
