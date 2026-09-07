import { BaseProvider } from './BaseProvider.js';
import { AIProvider, AIRequest, AIResponse, TaskCategory } from '../types/index.js';
import OpenAI from 'openai';

export class OpenAIProvider extends BaseProvider {
  private openai: OpenAI;

  constructor(apiKey: string, rateLimit: number) {
    super(apiKey, AIProvider.OPENAI, rateLimit);
    this.openai = new OpenAI({ apiKey });
  }

  async sendRequest(request: AIRequest): Promise<AIResponse> {
    if (this.isRateLimited()) {
      throw new Error(`OpenAI rate limit exceeded: ${this.requestCount}/${this.rateLimit}`);
    }

    const startTime = Date.now();

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: request.systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: request.prompt }
        ],
        max_tokens: request.maxTokens || 2048,
        temperature: request.temperature || 0.7
      });

      this.incrementRequestCount();
      const latency = Date.now() - startTime;

      return {
        provider: AIProvider.OPENAI,
        content: response.choices[0].message.content || '',
        tokensUsed: response.usage?.total_tokens || 0,
        cost: (response.usage?.total_tokens || 0) * 0.00003, // Approximate cost
        latency,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`OpenAI request failed: ${error}`);
    }
  }
}
