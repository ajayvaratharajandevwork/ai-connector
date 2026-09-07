import { AIProvider, AIRequest, AIResponse } from '../types/index.js';

export abstract class BaseProvider {
  protected apiKey: string;
  protected provider: AIProvider;
  protected rateLimit: number;
  protected requestCount: number = 0;
  protected lastResetTime: Date = new Date();

  constructor(apiKey: string, provider: AIProvider, rateLimit: number) {
    this.apiKey = apiKey;
    this.provider = provider;
    this.rateLimit = rateLimit;
  }

  abstract sendRequest(request: AIRequest): Promise<AIResponse>;

  protected resetRateLimitIfNeeded(): void {
    const now = new Date();
    const timeDiff = (now.getTime() - this.lastResetTime.getTime()) / 1000 / 60; // minutes
    if (timeDiff >= 1) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
  }

  isRateLimited(): boolean {
    this.resetRateLimitIfNeeded();
    return this.requestCount >= this.rateLimit;
  }

  getRemainingRequests(): number {
    this.resetRateLimitIfNeeded();
    return Math.max(0, this.rateLimit - this.requestCount);
  }

  incrementRequestCount(): void {
    this.requestCount++;
  }
}
