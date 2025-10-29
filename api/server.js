import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory storage (replace with a real database in production)
const chats = new Map();
let chatIdCounter = 1;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Speedy AI API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      chat: '/api/chats',
      openrouter: '/api/openrouter'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OpenRouter proxy endpoints
app.get('/api/openrouter/models', async (req, res) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.YOUR_SITE_URL || 'https://speedy-09j8.onrender.com',
        'X-Title': process.env.YOUR_SITE_NAME || 'Speedy AI'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/openrouter/chat', async (req, res) => {
  try {
    const { messages, model, stream = false } = req.body;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.YOUR_SITE_URL || 'https://speedy-09j8.onrender.com',
        'X-Title': process.env.YOUR_SITE_NAME || 'Speedy AI',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        stream
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in chat completion:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat management endpoints
app.get('/api/chats', (req, res) => {
  const { search } = req.query;
  let chatList = Array.from(chats.values());
  
  if (search) {
    const searchLower = search.toLowerCase();
    chatList = chatList.filter(chat => 
      chat.title.toLowerCase().includes(searchLower) ||
      chat.messages.some(msg => msg.content.toLowerCase().includes(searchLower))
    );
  }
  
  // Sort by updated_at descending
  chatList.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  
  res.json(chatList);
});

app.post('/api/chats', (req, res) => {
  const { title = 'New Chat', messages = [] } = req.body;
  
  const chat = {
    id: chatIdCounter++,
    title,
    messages,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  chats.set(chat.id, chat);
  res.json(chat);
});

app.get('/api/chats/:id', (req, res) => {
  const chatId = parseInt(req.params.id);
  const chat = chats.get(chatId);
  
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  
  res.json(chat);
});

app.delete('/api/chats/:id', (req, res) => {
  const chatId = parseInt(req.params.id);
  
  if (!chats.has(chatId)) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  
  chats.delete(chatId);
  res.json({ success: true, message: 'Chat deleted' });
});

app.post('/api/chats/:id/message', (req, res) => {
  const chatId = parseInt(req.params.id);
  const { role, content, context = [] } = req.body;
  
  const chat = chats.get(chatId);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  
  const message = {
    role,
    content,
    context,
    timestamp: new Date().toISOString()
  };
  
  chat.messages.push(message);
  chat.updated_at = new Date().toISOString();
  
  res.json({ success: true, message });
});

app.post('/api/chats/:id/generate-title', async (req, res) => {
  const chatId = parseInt(req.params.id);
  const chat = chats.get(chatId);
  
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  
  try {
    // Generate a title based on the first user message
    const firstUserMessage = chat.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      // Simple title generation: take first 50 chars
      const title = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
      chat.title = title;
      chat.updated_at = new Date().toISOString();
    }
    
    res.json({ success: true, title: chat.title });
  } catch (error) {
    console.error('Error generating title:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/chats/:id/title', (req, res) => {
  const chatId = parseInt(req.params.id);
  const { title } = req.body;
  
  const chat = chats.get(chatId);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  
  chat.title = title;
  chat.updated_at = new Date().toISOString();
  
  res.json({ success: true, chat });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Speedy AI API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

