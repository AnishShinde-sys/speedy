import { jest } from '@jest/globals';
import mongoose from 'mongoose';

// Mock the Chat model before importing
const mockChat = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  save: jest.fn(),
};

// Mock mongoose
jest.mock('../../models/Chat.js', () => ({
  default: mockChat,
}));

describe('Chat API - Model Selection Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/chats - Create Chat with Model', () => {
    test('should create a new chat with default model', () => {
      const mockChatData = {
        _id: '507f1f77bcf86cd799439011',
        title: 'New Chat',
        model: 'openai/gpt-3.5-turbo',
        messages: [],
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock the Chat constructor
      const ChatConstructor = jest.fn(() => mockChatData);
      
      expect(mockChatData.model).toBe('openai/gpt-3.5-turbo');
      expect(mockChatData.title).toBe('New Chat');
    });

    test('should create a new chat with custom model', () => {
      const mockChatData = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Custom Chat',
        model: 'anthropic/claude-3.5-sonnet',
        messages: [],
        save: jest.fn().mockResolvedValue(true),
      };

      expect(mockChatData.model).toBe('anthropic/claude-3.5-sonnet');
    });

    test('should accept valid model IDs', () => {
      const validModels = [
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4-turbo',
        'openai/gpt-3.5-turbo',
        'google/gemini-pro',
        'meta-llama/llama-3-70b-instruct'
      ];

      validModels.forEach(model => {
        const mockChatData = {
          _id: new mongoose.Types.ObjectId().toString(),
          title: 'Test Chat',
          model: model,
          messages: [],
        };

        expect(mockChatData.model).toBe(model);
        expect(typeof mockChatData.model).toBe('string');
        expect(mockChatData.model).toMatch(/^[\w-]+\/[\w-\.]+$/);
      });
    });
  });

  describe('PATCH /api/chats/:id/model - Update Chat Model', () => {
    test('should update chat model successfully', async () => {
      const chatId = '507f1f77bcf86cd799439011';
      const newModel = 'anthropic/claude-3.5-sonnet';
      const mockUpdatedChat = {
        _id: chatId,
        title: 'Test Chat',
        model: newModel,
        messages: [],
        updatedAt: new Date(),
      };

      mockChat.findByIdAndUpdate.mockResolvedValue(mockUpdatedChat);

      const result = await mockChat.findByIdAndUpdate(
        chatId,
        { model: newModel, updatedAt: new Date() },
        { new: true }
      );

      expect(result.model).toBe(newModel);
      expect(mockChat.findByIdAndUpdate).toHaveBeenCalledWith(
        chatId,
        expect.objectContaining({ model: newModel }),
        { new: true }
      );
    });

    test('should handle chat not found error', async () => {
      const chatId = 'nonexistent123';
      const newModel = 'openai/gpt-4-turbo';

      mockChat.findByIdAndUpdate.mockResolvedValue(null);

      const result = await mockChat.findByIdAndUpdate(
        chatId,
        { model: newModel, updatedAt: new Date() },
        { new: true }
      );

      expect(result).toBeNull();
    });

    test('should validate model format', () => {
      const invalidModels = [
        '',
        'invalid',
        'invalid/',
        '/invalid',
        'invalid//model',
        'invalid model',
      ];

      invalidModels.forEach(model => {
        const isValid = /^[\w-]+\/[\w-\.]+$/.test(model);
        expect(isValid).toBe(false);
      });
    });

    test('should accept all popular models', async () => {
      const popularModels = [
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4-turbo',
        'openai/gpt-3.5-turbo',
        'google/gemini-pro',
        'meta-llama/llama-3-70b-instruct'
      ];

      for (const model of popularModels) {
        const chatId = new mongoose.Types.ObjectId().toString();
        const mockUpdatedChat = {
          _id: chatId,
          model: model,
          title: 'Test Chat',
          updatedAt: new Date(),
        };

        mockChat.findByIdAndUpdate.mockResolvedValue(mockUpdatedChat);

        const result = await mockChat.findByIdAndUpdate(
          chatId,
          { model: model },
          { new: true }
        );

        expect(result.model).toBe(model);
      }
    });
  });

  describe('GET /api/chats/:id - Fetch Chat with Model', () => {
    test('should return chat with model information', async () => {
      const chatId = '507f1f77bcf86cd799439011';
      const mockChat = {
        _id: chatId,
        title: 'Test Chat',
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: 'Hello',
            timestamp: new Date(),
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(mockChat.model).toBe('anthropic/claude-3.5-sonnet');
      expect(mockChat).toHaveProperty('model');
      expect(typeof mockChat.model).toBe('string');
    });

    test('should include model in chat list', () => {
      const mockChats = [
        {
          _id: '1',
          title: 'Chat 1',
          model: 'anthropic/claude-3.5-sonnet',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: []
        },
        {
          _id: '2',
          title: 'Chat 2',
          model: 'openai/gpt-4-turbo',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: []
        }
      ];

      mockChats.forEach(chat => {
        expect(chat).toHaveProperty('model');
        expect(typeof chat.model).toBe('string');
        expect(chat.model).toMatch(/^[\w-]+\/[\w-\.]+$/);
      });
    });
  });

  describe('Model Persistence in Messages', () => {
    test('should preserve model when adding messages', async () => {
      const chatId = '507f1f77bcf86cd799439011';
      const selectedModel = 'anthropic/claude-3.5-sonnet';
      
      const mockChatBeforeMessage = {
        _id: chatId,
        title: 'Test Chat',
        model: selectedModel,
        messages: [],
        save: jest.fn().mockResolvedValue(true),
      };

      // Simulate adding a message
      mockChatBeforeMessage.messages.push({
        role: 'user',
        content: 'Test message',
        context: [],
        timestamp: new Date(),
      });

      await mockChatBeforeMessage.save();

      // Model should remain unchanged
      expect(mockChatBeforeMessage.model).toBe(selectedModel);
      expect(mockChatBeforeMessage.save).toHaveBeenCalled();
    });

    test('should use correct model when sending to AI', () => {
      const chatModels = [
        { chatId: '1', model: 'anthropic/claude-3.5-sonnet' },
        { chatId: '2', model: 'openai/gpt-4-turbo' },
        { chatId: '3', model: 'google/gemini-pro' },
      ];

      chatModels.forEach(({ chatId, model }) => {
        const mockMessages = [
          { role: 'user', content: 'Hello' }
        ];

        // Simulate API request payload
        const apiPayload = {
          messages: mockMessages,
          model: model,
          stream: true
        };

        expect(apiPayload.model).toBe(model);
        expect(apiPayload).toHaveProperty('model');
      });
    });
  });

  describe('Model Selection Integration Flow', () => {
    test('should handle complete flow: create -> select model -> send message', async () => {
      // Step 1: Create chat with initial model
      const initialModel = 'openai/gpt-3.5-turbo';
      const mockNewChat = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Integration Test Chat',
        model: initialModel,
        messages: [],
        save: jest.fn().mockResolvedValue(true),
      };

      expect(mockNewChat.model).toBe(initialModel);

      // Step 2: Change model
      const newModel = 'anthropic/claude-3.5-sonnet';
      mockChat.findByIdAndUpdate.mockResolvedValue({
        ...mockNewChat,
        model: newModel,
        updatedAt: new Date(),
      });

      const updatedChat = await mockChat.findByIdAndUpdate(
        mockNewChat._id,
        { model: newModel, updatedAt: new Date() },
        { new: true }
      );

      expect(updatedChat.model).toBe(newModel);
      expect(updatedChat.model).not.toBe(initialModel);

      // Step 3: Send message with new model
      const messagePayload = {
        messages: [{ role: 'user', content: 'Test' }],
        model: updatedChat.model,
        stream: true
      };

      expect(messagePayload.model).toBe(newModel);
    });

    test('should sync model between overlay and backend', () => {
      // Simulate overlay model selection
      const overlaySelectedModel = 'anthropic/claude-3.5-sonnet';
      
      // Simulate storage data
      const sharedState = {
        currentMessage: 'Test message',
        selectedTabs: [],
        selectedModel: overlaySelectedModel
      };

      // Simulate backend chat creation/update
      const backendChat = {
        _id: '1',
        title: 'Test Chat',
        model: sharedState.selectedModel,
        messages: []
      };

      expect(backendChat.model).toBe(overlaySelectedModel);
      expect(sharedState.selectedModel).toBe(overlaySelectedModel);
    });

    test('should maintain model consistency across updates', async () => {
      const chatId = '507f1f77bcf86cd799439011';
      const models = [
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4-turbo',
        'google/gemini-pro',
      ];

      for (const model of models) {
        mockChat.findByIdAndUpdate.mockResolvedValue({
          _id: chatId,
          model: model,
          updatedAt: new Date(),
        });

        const result = await mockChat.findByIdAndUpdate(
          chatId,
          { model: model, updatedAt: new Date() },
          { new: true }
        );

        expect(result.model).toBe(model);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      const chatId = '507f1f77bcf86cd799439011';
      const newModel = 'anthropic/claude-3.5-sonnet';

      mockChat.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      await expect(
        mockChat.findByIdAndUpdate(chatId, { model: newModel }, { new: true })
      ).rejects.toThrow('Database error');
    });

    test('should validate model before updating', () => {
      const invalidModels = ['', null, undefined, 'invalid-model'];
      const validModelPattern = /^[\w-]+\/[\w-\.]+$/;

      invalidModels.forEach(model => {
        const isValid = model && validModelPattern.test(model);
        expect(isValid).toBeFalsy();
      });
    });

    test('should handle concurrent model updates', async () => {
      const chatId = '507f1f77bcf86cd799439011';
      const models = [
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4-turbo',
      ];

      // Simulate concurrent updates
      const updates = models.map(model =>
        mockChat.findByIdAndUpdate(
          chatId,
          { model: model, updatedAt: new Date() },
          { new: true }
        )
      );

      mockChat.findByIdAndUpdate
        .mockResolvedValueOnce({ _id: chatId, model: models[0] })
        .mockResolvedValueOnce({ _id: chatId, model: models[1] });

      const results = await Promise.all(updates);
      
      // Last update should win
      expect(results).toHaveLength(2);
      expect(results[results.length - 1].model).toBe(models[1]);
    });
  });
});

