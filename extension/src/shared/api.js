// API client for communicating with the backend

const API_BASE_URL = 'http://localhost:3001';

// Fetch all chats
export async function fetchChats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
}

// Fetch single chat
export async function fetchChat(chatId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat:', error);
    throw error;
  }
}

// Create new chat
export async function createChat(title = 'New Chat', model = 'openai/gpt-3.5-turbo') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, model }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create chat');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}

// Add message to chat
export async function addMessage(chatId, role, content, context = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role, content, context }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

// Send message and get AI response (with streaming)
export async function sendMessage(chatId, message, context, model, onChunk) {
  try {
    // First, add user message to chat
    await addMessage(chatId, 'user', message, context);
    
    // Get chat to build message history
    const chat = await fetchChat(chatId);
    
    // Prepare messages for OpenRouter
    const messages = chat.messages.map(msg => ({
      role: msg.role,
      content: buildMessageContent(msg.content, msg.context)
    }));
    
    // Stream response from OpenRouter
    const response = await fetch(`${API_BASE_URL}/api/openrouter/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: model || chat.model,
        stream: true
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }
    
    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            // Save complete response to chat
            await addMessage(chatId, 'assistant', fullResponse, []);
            return fullResponse;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            
            if (content) {
              fullResponse += content;
              if (onChunk) {
                onChunk(content, fullResponse);
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
    
    // Save final response
    await addMessage(chatId, 'assistant', fullResponse, []);
    return fullResponse;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

et // Build message content with context using proper XML-style tags
function buildMessageContent(content, context = []) {
  if (!context || context.length === 0) {
    return content;
  }
  
  let contextText = '<additional_information>\n';
  contextText += 'Below is additional context information that may be relevant to answering the user\'s query:\n\n';
  
  for (const ctx of context) {
    switch (ctx.type) {
      case 'tab':
        contextText += `<content source="webpage" title="${escapeXml(ctx.data.title)}" url="${escapeXml(ctx.data.url || '')}">\n`;
        contextText += `${ctx.data.content || ''}\n`;
        contextText += `</content>\n\n`;
        break;
      case 'text':
        contextText += `<content source="selected_text">\n`;
        contextText += `${ctx.data.text || ''}\n`;
        contextText += `</content>\n\n`;
        break;
      case 'file':
        contextText += `<content source="file" filename="${escapeXml(ctx.data.name)}" type="${escapeXml(ctx.data.type || '')}">\n`;
        contextText += `File attached: ${ctx.data.name}\n`;
        contextText += `</content>\n\n`;
        break;
      case 'image':
        contextText += `<content source="image" filename="${escapeXml(ctx.data.name)}">\n`;
        contextText += `Image attached: ${ctx.data.name}\n`;
        contextText += `</content>\n\n`;
        break;
    }
  }
  
  contextText += '</additional_information>\n\n';
  
  return contextText + content;
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Update chat model
export async function updateChatModel(chatId, model) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/model`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update chat model');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating chat model:', error);
    throw error;
  }
}

// Delete chat
export async function deleteChat(chatId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
}

// Get available models from OpenRouter
export async function getModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/openrouter/models`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}


