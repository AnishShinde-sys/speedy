// Speedy AI Floating Action Button (FAB)
// Always visible button on the page to activate the extension

(function() {
  'use strict';
  
  // Prevent multiple injections
  if (window.__SPEEDY_FAB_INJECTED__) {
    console.log('FAB already injected');
    return;
  }
  window.__SPEEDY_FAB_INJECTED__ = true;
  
  // Create FAB button
  const fab = document.createElement('button');
  fab.id = 'speedy-ai-fab';
  fab.setAttribute('aria-label', 'Open Speedy AI Assistant');
  fab.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  
  fab.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 50%;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4), 
                0 8px 32px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    z-index: 999998;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    transform: scale(0);
    animation: fabSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.3s;
    outline: none;
    user-select: none;
  `;
  
  // Add styles for animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fabSlideIn {
      from {
        opacity: 0;
        transform: scale(0) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    @keyframes fabPulse {
      0%, 100% {
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4), 
                    0 8px 32px rgba(0, 0, 0, 0.15);
      }
      50% {
        box-shadow: 0 4px 25px rgba(102, 126, 234, 0.6), 
                    0 8px 40px rgba(0, 0, 0, 0.2);
      }
    }
    
    #speedy-ai-fab:hover {
      transform: scale(1.1) rotate(10deg) !important;
      box-shadow: 0 6px 28px rgba(102, 126, 234, 0.5), 
                  0 12px 40px rgba(0, 0, 0, 0.2) !important;
    }
    
    #speedy-ai-fab:active {
      transform: scale(0.95) !important;
    }
    
    #speedy-ai-fab svg {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    #speedy-ai-fab:hover svg {
      transform: scale(1.1);
    }
    
    #speedy-ai-fab.pulse {
      animation: fabPulse 2s ease-in-out infinite;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(fab);
  
  // Click handler - triggers overlay toggle
  fab.addEventListener('click', () => {
    console.log('🎯 FAB clicked - toggling overlay');
    
    // Send message to content script to toggle overlay
    window.postMessage({
      type: 'SPEEDY_TOGGLE_OVERLAY'
    }, '*');
    
    // Add click ripple effect
    fab.style.transform = 'scale(0.9)';
    setTimeout(() => {
      fab.style.transform = 'scale(1)';
    }, 150);
  });
  
  // Listen for overlay state changes to update FAB appearance
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data.type === 'SPEEDY_OVERLAY_STATE_CHANGED') {
      const isVisible = event.data.state?.isVisible;
      
      if (isVisible) {
        // Overlay is open - make FAB subtle
        fab.classList.remove('pulse');
        fab.style.opacity = '0.6';
      } else {
        // Overlay is closed - make FAB prominent
        fab.style.opacity = '1';
        fab.classList.add('pulse');
      }
    }
  });
  
  console.log('✅ Speedy AI FAB injected');
})();

