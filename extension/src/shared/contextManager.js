// Context manager for handling tab content, selected text, and file uploads

// Get current tab
export async function getCurrentTab() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB' }, (response) => {
      if (response && response.success) {
        resolve(response.tab);
      } else {
        reject(new Error(response?.error || 'Failed to get current tab'));
      }
    });
  });
}

// Get all tabs
export async function getAllTabs() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_ALL_TABS' }, (response) => {
      if (response && response.success) {
        resolve(response.tabs);
      } else {
        reject(new Error(response?.error || 'Failed to get all tabs'));
      }
    });
  });
}

// Extract content from a specific tab
export async function extractTabContent(tabId) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'EXTRACT_TAB_CONTENT', tabId }, (response) => {
      if (response && response.success) {
        resolve(response.content);
      } else {
        reject(new Error(response?.error || 'Failed to extract tab content'));
      }
    });
  });
}

// Get selected text from current tab
export async function getSelectedText() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_SELECTED_TEXT' }, (response) => {
      if (response && response.success) {
        resolve(response.text);
      } else {
        reject(new Error(response?.error || 'Failed to get selected text'));
      }
    });
  });
}

// Convert file to base64
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Handle file upload
export async function handleFileUpload(file) {
  try {
    const base64 = await fileToBase64(file);
    
    return {
      type: file.type.startsWith('image/') ? 'image' : 'file',
      data: {
        name: file.name,
        type: file.type,
        size: file.size,
        base64: base64
      }
    };
  } catch (error) {
    console.error('Error handling file upload:', error);
    throw error;
  }
}

// Create context object for tab
export function createTabContext(tab, content) {
  return {
    type: 'tab',
    data: {
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favIconUrl: tab.favIconUrl,
      content: content
    }
  };
}

// Create context object for selected text
export function createTextContext(text) {
  return {
    type: 'text',
    data: {
      text: text
    }
  };
}


