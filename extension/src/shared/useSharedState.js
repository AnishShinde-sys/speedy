import { useState, useEffect } from 'react';

// Custom hook for shared state between overlay and sidepanel
export function useSharedState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial value from storage
  useEffect(() => {
    chrome.storage.local.get(['sharedState'], (result) => {
      const sharedState = result.sharedState || {};
      
      if (sharedState[key] !== undefined) {
        setValue(sharedState[key]);
      }
      
      setIsLoading(false);
    });
  }, [key]);

  // Listen for changes
  useEffect(() => {
    const listener = (changes, area) => {
      if (area === 'local' && changes.sharedState) {
        const newState = changes.sharedState.newValue || {};
        
        if (newState[key] !== undefined) {
          setValue(newState[key]);
        }
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [key]);

  // Update value
  const updateValue = async (newValue) => {
    setValue(newValue);

    // Get current shared state
    const result = await chrome.storage.local.get(['sharedState']);
    const sharedState = result.sharedState || {};

    // Update the key
    sharedState[key] = newValue;

    // Save to storage
    await chrome.storage.local.set({ sharedState });

    // Broadcast to background
    chrome.runtime.sendMessage({
      type: 'SYNC_STATE',
      data: sharedState
    });
  };

  return [value, updateValue, isLoading];
}

// Hook for managing active chat ID
export function useActiveChatId() {
  return useSharedState('activeChatId', null);
}

// Hook for managing current input message
export function useCurrentMessage() {
  return useSharedState('currentMessage', '');
}

// Hook for managing selected contexts
export function useSelectedContexts() {
  return useSharedState('selectedContexts', []);
}

// Hook for managing selected model
export function useSelectedModel() {
  return useSharedState('selectedModel', 'openai/gpt-3.5-turbo');
}


