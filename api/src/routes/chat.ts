import express from 'express';
import { streamText } from 'ai';
import { z } from 'zod';
import { getModel } from '../models.js';

export const chatRouter = express.Router();

// Request validation schema
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  modelId: z.string(),
  pageContext: z.object({
    url: z.string().optional(),
    title: z.string().optional(),
    content: z.string().optional(),
    metadata: z.any().optional()
  }).optional(),
  clipboardHistory: z.array(z.any()).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().optional()
});

// POST /api/chat - Stream chat completions
chatRouter.post('/', async (req, res) => {
  try {
    // Validate request
    const data = ChatRequestSchema.parse(req.body);
    
    // Get the AI model
    const model = getModel(data.modelId);
    
    // Build system message with context
    let systemMessage = 'You are Speedy, an intelligent AI assistant built into a Chrome extension. You help users understand and interact with web content.';
    
    if (data.pageContext?.url) {
      systemMessage += `\n\nCurrent Page: ${data.pageContext.title || 'Untitled'}\nURL: ${data.pageContext.url}`;
    }
    
    if (data.pageContext?.content) {
      systemMessage += `\n\nPage Content:\n${data.pageContext.content.slice(0, 10000)}`;
    }
    
    if (data.clipboardHistory && data.clipboardHistory.length > 0) {
      systemMessage += `\n\nRecent Clipboard History:\n${JSON.stringify(data.clipboardHistory.slice(0, 5))}`;
    }
    
    // Add system message to the beginning
    const messages = [
      { role: 'system' as const, content: systemMessage },
      ...data.messages
    ];
    
    // Stream the response
    const result = await streamText({
      model,
      messages,
      temperature: data.temperature ?? 0.7,
      maxTokens: data.maxTokens ?? 4096,
    });
    
    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Stream the response using AI SDK's data stream
    result.pipeDataStreamToResponse(res);
    
  } catch (error: any) {
    console.error('Chat error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to process chat request' 
    });
  }
});

// POST /api/chat/simple - Non-streaming completion (for simple use cases)
chatRouter.post('/simple', async (req, res) => {
  try {
    const data = ChatRequestSchema.parse(req.body);
    const model = getModel(data.modelId);
    
    // Build system message
    let systemMessage = 'You are Speedy, an intelligent AI assistant.';
    if (data.pageContext?.content) {
      systemMessage += `\n\nPage Content:\n${data.pageContext.content.slice(0, 5000)}`;
    }
    
    const messages = [
      { role: 'system' as const, content: systemMessage },
      ...data.messages
    ];
    
    const result = await streamText({
      model,
      messages,
      temperature: data.temperature ?? 0.7,
      maxTokens: data.maxTokens ?? 4096,
    });
    
    // Collect full response
    const fullText = await result.text;
    
    res.json({
      content: fullText,
      model: data.modelId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process chat request' 
    });
  }
});

