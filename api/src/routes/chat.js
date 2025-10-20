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

// Update chat model
router.patch('/:id/model', async (req, res) => {
  try {
    const { model } = req.body;
    
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { model, updatedAt: new Date() },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat model:', error);
    res.status(500).json({ error: 'Failed to update chat model' });
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


