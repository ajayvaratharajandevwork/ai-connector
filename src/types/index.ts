// AI Provider Types
export enum AIProvider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  GROQ = 'groq',
  COHERE = 'cohere',
  LLAMA = 'llama'
}

// Task Categories for AI Selection
export enum TaskCategory {
  CODE_GENERATION = 'code_generation',
  TEXT_ANALYSIS = 'text_analysis',
  CREATIVE_WRITING = 'creative_writing',
  DATA_PROCESSING = 'data_processing',
  REASONING = 'reasoning',
  IMAGE_GENERATION = 'image_generation',
  GENERAL = 'general'
}

// AI Capability Ratings
export interface AICapabilities {
  codeGeneration: number; // 1-10
  reasoning: number; // 1-10
  creativity: number; // 1-10
  speed: number; // 1-10
  costEfficiency: number; // 1-10
  contextWindow: number; // tokens
}

// Provider Configuration
export interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  rateLimit: number; // requests per minute
  priority: number; // 1 = highest priority
  enabled: boolean;
  capabilities: AICapabilities;
}

// Request/Response Types
export interface AIRequest {
  prompt: string;
  taskCategory: TaskCategory;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  provider: AIProvider;
  content: string;
  tokensUsed: number;
  cost: number;
  latency: number; // ms
  timestamp: Date;
}

// Rate Limit Tracking
export interface RateLimitStatus {
  provider: AIProvider;
  requestsUsed: number;
  requestsLimit: number;
  resetTime: Date;
  isLimited: boolean;
}

// Fallback Strategy
export interface FallbackStrategy {
  maxRetries: number;
  priorityOrder: AIProvider[];
  retryDelay: number; // ms
  fallbackOnRateLimit: boolean;
  fallbackOnError: boolean;
}

// Analytics
export interface RequestMetrics {
  provider: AIProvider;
  taskCategory: TaskCategory;
  successRate: number;
  averageLatency: number;
  totalRequests: number;
  totalCost: number;
  failureCount: number;
}
