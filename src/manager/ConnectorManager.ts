import { AIProvider, AIRequest, AIResponse, TaskCategory, ProviderConfig, FallbackStrategy, RateLimitStatus } from '../types/index.js';
import { BaseProvider } from '../providers/BaseProvider.js';
import { OpenAIProvider } from '../providers/OpenAIProvider.js';
import { ClaudeProvider } from '../providers/ClaudeProvider.js';
import { AISelector } from '../selector/AISelector.js';
import { loadProviderConfigs } from '../config/providers.js';

export class ConnectorManager {
  private providers: Map<AIProvider, BaseProvider> = new Map();
  private selector: AISelector;
  private configs: ProviderConfig[];
  private fallbackStrategy: FallbackStrategy;
  private requestHistory: AIResponse[] = [];
  private maxHistorySize: number = 1000;

  constructor(fallbackStrategy?: FallbackStrategy) {
    this.configs = loadProviderConfigs();
    this.selector = new AISelector(this.configs);
    this.fallbackStrategy = fallbackStrategy || this.getDefaultFallbackStrategy();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    for (const config of this.configs) {
      if (config.provider === AIProvider.OPENAI) {
        this.providers.set(AIProvider.OPENAI, new OpenAIProvider(config.apiKey, config.rateLimit));
      } else if (config.provider === AIProvider.CLAUDE) {
        this.providers.set(AIProvider.CLAUDE, new ClaudeProvider(config.apiKey, config.rateLimit));
      }
    }
  }

  async executeRequest(request: AIRequest): Promise<AIResponse> {
    const priorityOrder = this.selector.getPriorityOrder(request.taskCategory);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.fallbackStrategy.maxRetries; attempt++) {
      for (const provider of priorityOrder) {
        const providerInstance = this.providers.get(provider);
        if (!providerInstance) continue;

        try {
          const response = await providerInstance.sendRequest(request);
          this.requestHistory.push(response);
          this.maintainHistory();
          return response;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Provider ${provider} failed: ${lastError.message}`);
          
          if (error instanceof Error && error.message.includes('rate limit')) {
            if (!this.fallbackStrategy.fallbackOnRateLimit) throw error;
          } else if (!this.fallbackStrategy.fallbackOnError) {
            throw error;
          }
        }
      }

      if (attempt < this.fallbackStrategy.maxRetries - 1) {
        await this.delay(this.fallbackStrategy.retryDelay);
      }
    }

    throw new Error(`All providers failed. Last error: ${lastError?.message}`);
  }

  getRateLimitStatus(): RateLimitStatus[] {
    return Array.from(this.providers.entries()).map(([provider, instance]) => {
      const config = this.configs.find(c => c.provider === provider);
      return {
        provider,
        requestsUsed: config?.rateLimit ? config.rateLimit - instance.getRemainingRequests() : 0,
        requestsLimit: config?.rateLimit || 0,
        resetTime: new Date(Date.now() + 60000), // Assuming 1-minute reset
        isLimited: instance.isRateLimited()
      };
    });
  }

  getRequestHistory(): AIResponse[] {
    return [...this.requestHistory];
  }

  getMetrics() {
    return {
      totalRequests: this.requestHistory.length,
      averageCost: this.requestHistory.length > 0 
        ? this.requestHistory.reduce((sum, r) => sum + r.cost, 0) / this.requestHistory.length 
        : 0,
      averageLatency: this.requestHistory.length > 0
        ? this.requestHistory.reduce((sum, r) => sum + r.latency, 0) / this.requestHistory.length
        : 0,
      providerStats: this.getProviderStats()
    };
  }

  private getProviderStats() {
    const stats: Record<string, any> = {};
    for (const response of this.requestHistory) {
      if (!stats[response.provider]) {
        stats[response.provider] = { count: 0, totalCost: 0, totalLatency: 0 };
      }
      stats[response.provider].count++;
      stats[response.provider].totalCost += response.cost;
      stats[response.provider].totalLatency += response.latency;
    }
    return stats;
  }

  private maintainHistory(): void {
    if (this.requestHistory.length > this.maxHistorySize) {
      this.requestHistory = this.requestHistory.slice(-this.maxHistorySize);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getDefaultFallbackStrategy(): FallbackStrategy {
    return {
      maxRetries: 3,
      priorityOrder: [AIProvider.OPENAI, AIProvider.CLAUDE, AIProvider.GROQ],
      retryDelay: 1000,
      fallbackOnRateLimit: true,
      fallbackOnError: true
    };
  }
}
