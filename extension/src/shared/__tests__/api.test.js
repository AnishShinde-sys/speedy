import { jest } from '@jest/globals';

// Mock fetch globally
global.fetch = jest.fn();

// Import after mocking
import { 
  createChat, 
  updateChatModel, 
  sendMessage,
  fetchChat 
} from '../api.js';

describe('Frontend API - Model Selector Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('createChat with model', () => {
    test('should create chat with default model', async () => {
      const mockResponse = {
        _id: '507f1f77bcf86cd799439011',
        title: 'New Chat',
        model: 'openai/gpt-3.5-turbo',
        messages: [],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createChat('New Chat', 'openai/gpt-3.5-turbo');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/chats',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: 'New Chat', 
            model: 'openai/gpt-3.5-turbo' 
          }),
        })
      );

      expect(result.model).toBe('openai/gpt-3.5-turbo');
    });

    test('should create chat with custom model', async () => {
      const customModel = 'anthropic/claude-3.5-sonnet';
      const mockResponse = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Custom Chat',
        model: customModel,
        messages: [],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createChat('Custom Chat', customModel);

      expect(result.model).toBe(customModel);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/chats',
        expect.objectContaining({
          body: JSON.stringify({ 
            title: 'Custom Chat', 
            model: customModel 
          }),
        })
      );
    });

    test('should handle popular models correctly', async () => {
      const popularModels = [
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4-turbo',
        'openai/gpt-3.5-turbo',
        'google/gemini-pro',
        'meta-llama/llama-3-70b-instruct'
      ];

      for (const model of popularModels) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            _id: Math.random().toString(),
            title: 'Test Chat',
            model: model,
            messages: [],
          }),
        });

        const result = await createChat('Test Chat', model);
        expect(result.model).toBe(model);
      }
    });
  });

  describe('updateChatModel', () => {
    test('should update chat model successfully', async () => {
      const chatId = '507f1f77bcf86cd799439011';
      const newModel = 'anthropic/claude-3.5-sonnet';
      const mockResponse = {
        _id: chatId,
        title: 'Test Chat',
        model: newModel,
        updatedAt: new Date().toISOString(),
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await updateChatModel(chatId, newModel);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/chats/${chatId}/model`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: newModel }),
        })
      );

      expect(result.model).toBe(newModel);
    });

    test('should handle update errors', async () => {
      const chatId = 'invalid-id';
      const newModel = 'anthropic/claude-3.5-sonnet';

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(updateChatModel(chatId, newModel)).rejects.toThrow();
    });

    test('should update model multiple times', async () => {
      const chatId = '507f1f77bcf86cd799439011';
      const models = [
        'openai/gpt-3.5-turbo',
        'anthropic/claude-3.5-sonnet',
        'google/gemini-pro',
      ];

      for (const model of models) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            _id: chatId,
            model: model,
            updatedAt: new Date().toISOString(),
          }),
        });

        const result = await updateChatModel(chatId, model);
        expect(result.model).toBe(model);
      }

      expect(global.fetch).toHaveBeenCalledTimes(models.length);
    });
  });

  describe('sendMessage with model', () => {
    test('should send message with selected model', async () => {
      const chatId = '507f1f77bcf86cd799439011';
      const message = 'Test message';
      const selectedModel = 'anthropic/claude-3.5-sonnet';
      const context = [];

      // Mock add message response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: chatId,
          messages: [{ role: 'user', content: message }],
        }),
      });

      // Mock fetch chat response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: chatId,
          model: 'openai/gpt-3.5-turbo', // original model
          messages: [{ role: 'user', content: message }],
        }),
      });

      // Mock streaming response
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Test"}}]}\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n'),
          })
          .mockResolvedValueOnce({
            done: true,
          }),
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      // Mock final add message response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: chatId,
          messages: [
            { role: 'user', content: message },
            { role: 'assistant', content: 'Test' },
          ],
        }),
      });

      const onChunk = jest.fn();
      await sendMessage(chatId, message, context, selectedModel, onChunk);

      // Verify the OpenRouter API call used the selected model
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/openrouter/chat',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(`"model":"${selectedModel}"`),
        })
      );
    });

    test('should fallback to chat model if no model specified', async () => {
      const chatId = '507f1f77bcf86cd799439011';
      const message = 'Test message';
      const chatModel = 'openai/gpt-4-turbo';

      // Mock add message
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: chatId }),
      });

      // Mock fetch chat with model
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: chatId,
          model: chatModel,
          messages: [{ role: 'user', content: message }],
        }),
      });

      // Mock streaming response
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n'),
          })
          .mockResolvedValueOnce({
            done: true,
          }),
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: chatId }),
      });

      await sendMessage(chatId, message, [], null);

      // Should use the chat's model
      const openRouterCall = global.fetch.mock.calls.find(call => 
        call[0].includes('openrouter/chat')
      );
      
      expect(openRouterCall).toBeDefined();
      const requestBody = JSON.parse(openRouterCall[1].body);
      expect(requestBody.model).toBe(chatModel);
    });
  });

  describe('Full Integration Flow', () => {
    test('should complete full model selection flow', async () => {
      // Step 1: Create chat
      const initialModel = 'openai/gpt-3.5-turbo';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: '123',
          title: 'New Chat',
          model: initialModel,
          messages: [],
        }),
      });

      const chat = await createChat('New Chat', initialModel);
      expect(chat.model).toBe(initialModel);

      // Step 2: User selects different model in overlay
      const overlayModel = 'anthropic/claude-3.5-sonnet';

      // Step 3: Update chat model
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: chat._id,
          title: chat.title,
          model: overlayModel,
          updatedAt: new Date().toISOString(),
        }),
      });

      const updatedChat = await updateChatModel(chat._id, overlayModel);
      expect(updatedChat.model).toBe(overlayModel);
      expect(updatedChat.model).not.toBe(initialModel);

      // Step 4: Send message with new model
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ _id: chat._id }) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            _id: chat._id,
            model: overlayModel,
            messages: [{ role: 'user', content: 'Test' }],
          }),
        });

      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n'),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          body: { getReader: () => mockReader },
        })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ _id: chat._id }) });

      await sendMessage(chat._id, 'Test', [], overlayModel);

      // Verify model was used in OpenRouter call
      const openRouterCall = global.fetch.mock.calls.find(call =>
        call[0].includes('openrouter/chat')
      );
      const requestBody = JSON.parse(openRouterCall[1].body);
      expect(requestBody.model).toBe(overlayModel);
    });

    test('should sync overlay model with backend', () => {
      // Simulate overlay state
      const overlayState = {
        selectedModel: 'anthropic/claude-3.5-sonnet',
        message: 'Test message',
        selectedTabs: [],
      };

      // Simulate content script data
      const contentScriptData = {
        type: 'SPEEDY_OVERLAY_SUBMIT',
        message: overlayState.message,
        selectedTabs: overlayState.selectedTabs,
        model: overlayState.selectedModel,
      };

      // Verify data structure
      expect(contentScriptData.model).toBe(overlayState.selectedModel);
      expect(contentScriptData).toHaveProperty('model');
      expect(typeof contentScriptData.model).toBe('string');
    });
  });

  describe('Model Validation', () => {
    test('should validate model format', () => {
      const validModels = [
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4-turbo',
        'google/gemini-pro',
      ];

      const invalidModels = [
        '',
        'invalid',
        'invalid/',
        '/invalid',
        'invalid model',
      ];

      const modelPattern = /^[\w-]+\/[\w-\.]+$/;

      validModels.forEach(model => {
        expect(modelPattern.test(model)).toBe(true);
      });

      invalidModels.forEach(model => {
        expect(modelPattern.test(model)).toBe(false);
      });
    });

    test('should handle missing model gracefully', async () => {
      const chatId = '507f1f77bcf86cd799439011';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: chatId,
          title: 'Test Chat',
          model: 'openai/gpt-3.5-turbo', // fallback to default
          messages: [],
        }),
      });

      const result = await createChat('Test Chat');
      expect(result.model).toBeDefined();
      expect(typeof result.model).toBe('string');
    });
  });
});

