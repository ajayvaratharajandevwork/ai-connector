import { ConnectorManager } from '../manager/ConnectorManager.js';
import { AIRequest, TaskCategory } from '../types/index.js';

/**
 * ChatGPT Plugin for AI Connector
 * Provides OpenAI-compatible API endpoints for ChatGPT integration
 */
export class ChatGPTPlugin {
  private connector: ConnectorManager;

  constructor(connector: ConnectorManager) {
    this.connector = connector;
  }

  /**
   * Get plugin manifest for ChatGPT
   */
  getManifest() {
    return {
      schema_version: 'v1',
      name_for_human: 'AI Connector',
      name_for_model: 'ai_connector',
      description_for_human: 'Intelligently routes requests to the best AI service based on your needs',
      description_for_model: 'Routes user requests to optimal AI providers (ChatGPT, Claude, etc.) with automatic fallback',
      auth: {
        type: 'bearer',
        authorization_type: 'bearer'
      },
      api: {
        type: 'openai',
        url: process.env.PLUGIN_URL || 'https://your-connector-url.com',
        is_user_authenticated: false
      },
      logo_url: process.env.LOGO_URL || 'https://your-connector-url.com/logo.png',
      contact_email: 'support@your-connector.com',
      legal_info_url: 'https://your-connector-url.com/legal'
    };
  }

  /**
   * Process request from ChatGPT
   */
  async handleRequest(userMessage: string, context: any = {}) {
    try {
      // Detect task category from message
      const taskCategory = this.detectTaskCategory(userMessage);
      
      // Create AI request
      const request: AIRequest = {
        prompt: userMessage,
        taskCategory,
        maxTokens: context.maxTokens || 2048,
        temperature: context.temperature || 0.7,
        systemPrompt: context.systemPrompt || 'You are a helpful assistant.'
      };

      // Execute through connector
      const response = await this.connector.executeRequest(request);

      return {
        success: true,
        content: response.content,
        metadata: {
          provider: response.provider,
          tokensUsed: response.tokensUsed,
          cost: response.cost,
          latency: response.latency,
          timestamp: response.timestamp
        }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        fallbackMessage: 'Unable to process request. Please try again.'
      };
    }
  }

  /**
   * Get status of all connected AI services
   */
  getServiceStatus() {
    const rateLimits = this.connector.getRateLimitStatus();
    return {
      services: rateLimits.map(status => ({
        provider: status.provider,
        available: !status.isLimited,
        requestsRemaining: status.requestsLimit - status.requestsUsed,
        resetTime: status.resetTime
      })),
      metrics: this.connector.getMetrics()
    };
  }

  /**
   * Suggest best provider for a task
   */
  suggestBestProvider(userMessage: string) {
    const taskCategory = this.detectTaskCategory(userMessage);
    return {
      task: taskCategory,
      suggestion: `For ${taskCategory} tasks, the connector will route to the most suitable AI provider.`
    };
  }

  private detectTaskCategory(message: string): TaskCategory {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('code') || lowerMessage.includes('function') || lowerMessage.includes('program')) {
      return TaskCategory.CODE_GENERATION;
    } else if (lowerMessage.includes('analyze') || lowerMessage.includes('summarize') || lowerMessage.includes('extract')) {
      return TaskCategory.TEXT_ANALYSIS;
    } else if (lowerMessage.includes('creative') || lowerMessage.includes('story') || lowerMessage.includes('write')) {
      return TaskCategory.CREATIVE_WRITING;
    } else if (lowerMessage.includes('reason') || lowerMessage.includes('explain') || lowerMessage.includes('why')) {
      return TaskCategory.REASONING;
    } else if (lowerMessage.includes('process') || lowerMessage.includes('parse') || lowerMessage.includes('data')) {
      return TaskCategory.DATA_PROCESSING;
    } else if (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('generate')) {
      return TaskCategory.IMAGE_GENERATION;
    }

    return TaskCategory.GENERAL;
  }
}
