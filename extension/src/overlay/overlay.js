// Speedy AI Overlay - Cursor-Style Composer
(function() {
  'use strict';

  // Create the overlay HTML
  function createOverlay() {
    const overlayHTML = `
      <style>
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
          <div id="speedy-context-pills" style="
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            align-items: center;
            min-height: 20px;
            max-height: 44px;
            overflow: hidden;
            margin-bottom: 4px;
          ">
            <!-- @ Button -->
            <div tabindex="0" id="speedy-at-button" style="
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2px;
              height: 20px;
              width: 20px;
              box-sizing: border-box;
              border-radius: 4px;
              border: 1px solid rgba(255, 255, 255, 0.18);
              outline: none;
              flex-shrink: 0;
              background: transparent;
              transition: all 0.1s;
            ">
              <span style="font-size: 11px; color: rgba(255, 255, 255, 0.7);">@</span>
            </div>
          </div>
          
          <!-- Tab Selection Menu -->
          <div id="speedy-tab-menu" style="
            display: none;
            position: absolute;
            bottom: calc(100% + 8px);
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 1);
            border-radius: 12px;
            box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 24px, rgba(0, 0, 0, 0.05) 0px 2px 8px;
            max-height: 300px;
            overflow-y: auto;
            padding: 8px;
            z-index: 1001;
          ">
            <div style="padding: 8px 8px 4px; font-size: 12px; color: rgba(0,0,0,0.6); font-weight: 600; letter-spacing: 0.3px;">
              SELECT TABS TO ADD AS CONTEXT
            </div>
            <div id="speedy-tab-list"></div>
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
                     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
                  <div style="position: sticky; top: 0; background: #fff; padding: 4px 0px 8px; z-index: 1;">
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
    const popularModelsContainer = shadowRoot.getElementById('speedy-popular-models');
    const allModelsContainer = shadowRoot.getElementById('speedy-all-models');
    const allModelsSection = shadowRoot.getElementById('speedy-all-models-section');
    const messagesContainer = shadowRoot.getElementById('speedy-messages-container');
    const messagesList = shadowRoot.getElementById('speedy-messages-list');
    const imageUploadBtn = shadowRoot.getElementById('speedy-image-upload');
    
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
      'anthropic/claude-3-haiku',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
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
      popularModelsContainer.innerHTML = '';
      allModelsContainer.innerHTML = '';
      
      const query = searchQuery.toLowerCase();
      
      // Filter popular models
      const filteredPopular = popularModels.filter(modelId => {
        if (!query) return true;
        const model = availableModels.find(m => m.id === modelId);
        const name = model?.name || modelId;
        return name.toLowerCase().includes(query) || modelId.toLowerCase().includes(query);
      });
      
      // Render popular models
      filteredPopular.forEach(modelId => {
        const model = availableModels.find(m => m.id === modelId) || { 
          id: modelId, 
          name: modelId.split('/').pop() 
        };
        const modelButton = createModelButton(model);
        popularModelsContainer.appendChild(modelButton);
      });
      
      // Filter other models
      const otherModels = availableModels
        .filter(m => !popularModels.includes(m.id))
        .filter(m => {
          if (!query) return true;
          const name = m.name || m.id;
          return name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query);
        })
        .slice(0, 20);
      
      if (otherModels.length > 0) {
        allModelsSection.style.display = 'block';
        otherModels.forEach(model => {
          const modelButton = createModelButton(model);
          allModelsContainer.appendChild(modelButton);
        });
      } else {
        allModelsSection.style.display = 'none';
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
      window.postMessage({
        type: 'SPEEDY_REQUEST_TABS'
      }, '*');
    }
    
    function addContextChip(tab) {
      if (selectedTabs.find(t => t.id === tab.id)) return;
      
      selectedTabs.push(tab);
      
      const chip = document.createElement('div');
      chip.className = 'context-chip';
      chip.dataset.tabId = tab.id;
      chip.style.cssText = `
        display: inline-flex;
        align-items: center;
        height: 20px;
        padding: 0 6px;
        font-size: 12px;
        background: rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.1s;
        position: relative;
        gap: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      `;
      
      const title = tab.title.length > 20 ? tab.title.substring(0, 20) + '...' : tab.title;
      const favicon = tab.favIconUrl;
      
      chip.innerHTML = `
        ${favicon ? `<img src="${favicon}" onerror="this.style.display='none';" style="width: 12px; height: 12px; flex-shrink: 0; border-radius: 2px;" />` : ''}
        <span style="line-height: 1; font-size: 12px; color: rgba(255, 255, 255, 0.9); opacity: 0.6;">${title}</span>
        <button class="remove-chip" style="
          margin-left: 2px;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.4;
          transition: opacity 0.1s;
          width: 12px;
          height: 12px;
        ">
          <svg width="10" height="10" viewBox="0 0 512 512" fill="currentColor" style="display: block;">
            <path d="m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"/>
          </svg>
        </button>
      `;
      
      chip.addEventListener('mouseenter', () => {
        chip.style.background = 'rgba(255, 255, 255, 0.25)';
        const removeBtn = chip.querySelector('.remove-chip');
        if (removeBtn) removeBtn.style.opacity = '0.8';
      });
      
      chip.addEventListener('mouseleave', () => {
        chip.style.background = 'rgba(255, 255, 255, 0.15)';
        const removeBtn = chip.querySelector('.remove-chip');
        if (removeBtn) removeBtn.style.opacity = '0.4';
      });
      
      chip.querySelector('.remove-chip').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedTabs = selectedTabs.filter(t => t.id !== tab.id);
        chip.remove();
        syncContextToContentScript();
      });
      
      contextPills.insertBefore(chip, atButton);
      syncContextToContentScript();
    }
    
    function syncContextToContentScript() {
      window.postMessage({
        type: 'SPEEDY_CONTEXT_CHANGED',
        selectedTabs: selectedTabs
      }, '*');
    }
    
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
          transition: background 0.1s;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 1);
        `;
        
        const isSelected = selectedTabs.find(t => t.id === tab.id);
        if (isSelected) {
          tabItem.style.background = 'rgba(248, 248, 248, 1)';
        }
        
        const title = tab.title || 'Untitled';
        const displayTitle = title.length > 60 ? title.substring(0, 60) + '...' : title;
        const favicon = tab.favIconUrl;
        
        tabItem.innerHTML = `
          ${favicon ? `<img src="${favicon}" onerror="this.style.display='none';" style="width: 16px; height: 16px; flex-shrink: 0; border-radius: 2px;" />` : ''}
          <div style="flex: 1; font-size: 13px; color: #000; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${displayTitle}
          </div>
          <div style="
            width: 18px;
            height: 18px;
            border-radius: 4px;
            background: ${isSelected ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0,0,0,0.08)'};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          ">
            ${isSelected ? '<span style="color: white; font-size: 11px;">✓</span>' : ''}
          </div>
        `;
        
        tabItem.addEventListener('mouseenter', () => {
          if (!isSelected) {
            tabItem.style.background = 'rgba(245, 245, 245, 1)';
          }
        });
        
        tabItem.addEventListener('mouseleave', () => {
          if (!isSelected) {
            tabItem.style.background = 'rgba(255, 255, 255, 1)';
          }
        });
        
        tabItem.addEventListener('click', () => {
          if (isSelected) {
            selectedTabs = selectedTabs.filter(t => t.id !== tab.id);
            const chip = shadowRoot.querySelector(`[data-tab-id="${tab.id}"]`);
            if (chip) chip.remove();
          } else {
            addContextChip(tab);
          }
          
          renderTabList(availableTabs);
        });
        
        tabList.appendChild(tabItem);
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
          content: '',
          favIconUrl: tab.favIconUrl
        }
      }));
      
      message = '';
      input.textContent = '';
      button.disabled = true;
      button.style.color = 'rgba(255, 255, 255, 0.5)';
      updatePlaceholder();
      
      selectedTabs = [];
      shadowRoot.querySelectorAll('.context-chip').forEach(chip => chip.remove());
      
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
    setTimeout(initOverlay, 0);
  }
})();
