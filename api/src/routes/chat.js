import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();

// Get all chats
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find()
      .sort({ updatedAt: -1 })
      .select('_id title model createdAt updatedAt messages');
    
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Get single chat by ID
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Create new chat
router.post('/', async (req, res) => {
  try {
    const { title, model } = req.body;
    
    const chat = new Chat({
      title: title || 'New Chat',
      model: model || 'openai/gpt-3.5-turbo',
      messages: []
    });
    
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Add message to chat
router.post('/:id/message', async (req, res) => {
  try {
    const { role, content, context } = req.body;
    
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    chat.messages.push({
      role,
      content,
      context: context || [],
      timestamp: new Date()
    });
    
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Update chat title
router.patch('/:id/title', async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), updatedAt: new Date() },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat title:', error);
    res.status(500).json({ error: 'Failed to update chat title' });
  }
});

// Auto-generate chat title using LLM
router.post('/:id/generate-title', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Get first few messages for context
    const messagesToAnalyze = chat.messages.slice(0, 4).map(msg => ({
      role: msg.role,
      content: msg.content.substring(0, 500) // Limit content length
    }));
    
    if (messagesToAnalyze.length === 0) {
      return res.status(400).json({ error: 'No messages to generate title from' });
    }
    
    // Use a fast, small model for title generation (Haiku is fast and cheap)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001',
        'X-Title': 'Speedy AI'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku', // Fast and cheap model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates short, descriptive titles for conversations. Generate a title that is 2-5 words long, capturing the main topic. Respond with ONLY the title, no quotes or extra text.'
          },
          {
            role: 'user',
            content: `Generate a short title (2-5 words) for this conversation:\n\n${JSON.stringify(messagesToAnalyze)}`
          }
        ],
        max_tokens: 20,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const generatedTitle = data.choices[0].message.content.trim()
      .replace(/^["']|["']$/g, '') // Remove quotes if present
      .substring(0, 100); // Limit title length
    
    // Update chat with generated title
    chat.title = generatedTitle;
    chat.updatedAt = new Date();
    await chat.save();
    
    res.json(chat);
  } catch (error) {
    console.error('Error generating chat title:', error);
    res.status(500).json({ error: 'Failed to generate chat title' });
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

export default router;


