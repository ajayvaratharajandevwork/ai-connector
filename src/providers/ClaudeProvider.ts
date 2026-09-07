import { BaseProvider } from './BaseProvider.js';
import { AIProvider, AIRequest, AIResponse, TaskCategory } from '../types/index.js';
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeProvider extends BaseProvider {
  private anthropic: Anthropic;

  constructor(apiKey: string, rateLimit: number) {
    super(apiKey, AIProvider.CLAUDE, rateLimit);
    this.anthropic = new Anthropic({ apiKey });
  }

  async sendRequest(request: AIRequest): Promise<AIResponse> {
    if (this.isRateLimited()) {
      throw new Error(`Claude rate limit exceeded: ${this.requestCount}/${this.rateLimit}`);
    }

    const startTime = Date.now();

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: request.maxTokens || 2048,
        system: request.systemPrompt || 'You are a helpful assistant.',
        messages: [
          { role: 'user', content: request.prompt }
        ]
      });

      this.incrementRequestCount();
      const latency = Date.now() - startTime;

      return {
        provider: AIProvider.CLAUDE,
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        tokensUsed: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
        cost: ((response.usage?.input_tokens || 0) * 0.000003 + (response.usage?.output_tokens || 0) * 0.000015), // Approximate cost
        latency,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Claude request failed: ${error}`);
    }
  }
}
