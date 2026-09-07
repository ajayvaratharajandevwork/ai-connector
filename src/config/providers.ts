import { AIProvider, AICapabilities, ProviderConfig } from '../types/index.js';

// Default AI Capabilities Database
export const PROVIDER_CAPABILITIES: Record<AIProvider, AICapabilities> = {
  [AIProvider.OPENAI]: {
    codeGeneration: 9,
    reasoning: 8,
    creativity: 8,
    speed: 7,
    costEfficiency: 6,
    contextWindow: 128000
  },
  [AIProvider.CLAUDE]: {
    codeGeneration: 9,
    reasoning: 9,
    creativity: 8,
    speed: 6,
    costEfficiency: 5,
    contextWindow: 200000
  },
  [AIProvider.GROQ]: {
    codeGeneration: 7,
    reasoning: 7,
    creativity: 6,
    speed: 10,
    costEfficiency: 9,
    contextWindow: 32000
  },
  [AIProvider.COHERE]: {
    codeGeneration: 6,
    reasoning: 6,
    creativity: 7,
    speed: 8,
    costEfficiency: 7,
    contextWindow: 4096
  },
  [AIProvider.LLAMA]: {
    codeGeneration: 8,
    reasoning: 7,
    creativity: 7,
    speed: 5,
    costEfficiency: 10,
    contextWindow: 8000
  }
};

// Load providers from environment
export function loadProviderConfigs(): ProviderConfig[] {
  const configs: ProviderConfig[] = [];

  if (process.env.OPENAI_API_KEY) {
    configs.push({
      provider: AIProvider.OPENAI,
      apiKey: process.env.OPENAI_API_KEY,
      rateLimit: parseInt(process.env.OPENAI_RATE_LIMIT || '3'),
      priority: 1,
      enabled: true,
      capabilities: PROVIDER_CAPABILITIES[AIProvider.OPENAI]
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    configs.push({
      provider: AIProvider.CLAUDE,
      apiKey: process.env.ANTHROPIC_API_KEY,
      rateLimit: parseInt(process.env.ANTHROPIC_RATE_LIMIT || '50'),
      priority: 2,
      enabled: true,
      capabilities: PROVIDER_CAPABILITIES[AIProvider.CLAUDE]
    });
  }

  if (process.env.GROQ_API_KEY) {
    configs.push({
      provider: AIProvider.GROQ,
      apiKey: process.env.GROQ_API_KEY,
      rateLimit: parseInt(process.env.GROQ_RATE_LIMIT || '30'),
      priority: 3,
      enabled: true,
      capabilities: PROVIDER_CAPABILITIES[AIProvider.GROQ]
    });
  }

  return configs;
}
