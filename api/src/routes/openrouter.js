import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Send chat completion (with streaming)
router.post('/chat', async (req, res) => {
  try {
    const { messages, model, stream = true } = req.body;

    // Add system prompt if not already present
    const systemPrompt = {
      role: 'system',
      content: `You are Speedy AI, an intelligent assistant that helps users with various tasks. 

When the user provides context from web pages or other sources, it will be wrapped in <additional_information> tags with <content> tags inside. Each content tag may have attributes like:
- source: The type of content (webpage, selected_text, file, image)
- title: The title of the webpage
- url: The URL of the webpage
- filename: The name of the file
- type: The MIME type of the file

Example format:
<additional_information>
Below is additional context information that may be relevant to answering the user's query:

<content source="webpage" title="Page Title" url="https://example.com">
Content from the webpage...
</content>

<content source="selected_text">
Text selected by the user...
</content>
</additional_information>

Use this contextual information to provide more accurate and relevant responses. Always reference the specific sources when using information from them.`
    };

    // Prepend system prompt if messages don't already have one
    const messagesWithSystem = messages[0]?.role === 'system' 
      ? messages 
      : [systemPrompt, ...messages];

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3001',
        'X-Title': process.env.SITE_NAME || 'Speedy AI Assistant'
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-3.5-turbo',
        messages: messagesWithSystem,
        stream
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
    }

    if (stream) {
      // Set headers for SSE streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Pipe the response stream
      const reader = response.body;
      
      reader.on('data', (chunk) => {
        res.write(chunk);
      });

      reader.on('end', () => {
        res.end();
      });

      reader.on('error', (error) => {
        console.error('Stream error:', error);
        res.end();
      });

      // Handle client disconnect
      req.on('close', () => {
        reader.destroy();
      });
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Error in chat completion:', error);
    res.status(500).json({ error: error.message || 'Failed to complete chat' });
  }
});

export default router;


