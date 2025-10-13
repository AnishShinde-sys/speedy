import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';

// Debug: Log API keys at startup
console.log('🔑 API Keys Check:');
console.log('  OPENAI:', process.env.OPENAI_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('  ANTHROPIC:', process.env.ANTHROPIC_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('  GOOGLE:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('  MISTRAL:', process.env.MISTRAL_API_KEY ? '✅ SET' : '❌ NOT SET');

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'mistral';
  model: string;
  maxTokens?: number;
  description: string;
  enabled: boolean;
}

// Available models configuration
export const AVAILABLE_MODELS: ModelConfig[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 4096,
    description: 'Most capable OpenAI model, great for complex tasks',
    enabled: !!process.env.OPENAI_API_KEY
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxTokens: 4096,
    description: 'Faster and cheaper, good for most tasks',
    enabled: !!process.env.OPENAI_API_KEY
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    model: 'gpt-4-turbo',
    maxTokens: 4096,
    description: 'Previous generation flagship model',
    enabled: !!process.env.OPENAI_API_KEY
  },
  
  // Anthropic Models
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 8192,
    description: 'Most intelligent Claude model, excellent reasoning',
    enabled: !!process.env.ANTHROPIC_API_KEY
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 8192,
    description: 'Fast and efficient Claude model',
    enabled: !!process.env.ANTHROPIC_API_KEY
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    maxTokens: 4096,
    description: 'Most powerful Claude 3 model',
    enabled: !!process.env.ANTHROPIC_API_KEY
  },
  
  // Google Models
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
    maxTokens: 8192,
    description: 'Latest Gemini model, very fast',
    enabled: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    model: 'gemini-1.5-pro',
    maxTokens: 8192,
    description: 'High-capability Gemini model',
    enabled: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
  },
  
  // Mistral Models
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    model: 'mistral-large-latest',
    maxTokens: 4096,
    description: 'Flagship Mistral model',
    enabled: !!process.env.MISTRAL_API_KEY
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'mistral',
    model: 'mistral-small-latest',
    maxTokens: 4096,
    description: 'Efficient Mistral model',
    enabled: !!process.env.MISTRAL_API_KEY
  }
];

// Get model instance from AI SDK
export function getModel(modelId: string) {
  const config = AVAILABLE_MODELS.find(m => m.id === modelId);
  
  if (!config) {
    throw new Error(`Model ${modelId} not found`);
  }
  
  if (!config.enabled) {
    throw new Error(`Model ${modelId} is not enabled. Please add the required API key.`);
  }
  
  switch (config.provider) {
    case 'openai':
      return openai(config.model);
    case 'anthropic':
      return anthropic(config.model);
    case 'google':
      return google(config.model);
    case 'mistral':
      return mistral(config.model);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

// Get list of enabled models
export function getEnabledModels(): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.enabled);
}

