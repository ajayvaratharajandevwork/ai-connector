import { ConnectorManager } from '../manager/ConnectorManager.js';
import { AIRequest, TaskCategory } from '../types/index.js';

/**
 * Claude Plugin for AI Connector
 * Provides integration with Claude/Anthropic for use as a tool
 */
export class ClaudePlugin {
  private connector: ConnectorManager;

  constructor(connector: ConnectorManager) {
    this.connector = connector;
  }

  /**
   * Get tool definition for Claude
   */
  getToolDefinition() {
    return {
      name: 'ai_connector',
      description: 'Routes requests to the best available AI service based on task type and current availability',
      input_schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'The task or prompt to be processed'
          },
          task_type: {
            type: 'string',
            enum: [
              'code_generation',
              'text_analysis',
              'creative_writing',
              'data_processing',
              'reasoning',
              'general'
            ],
            description: 'The type of task to be performed'
          },
          max_tokens: {
            type: 'number',
            description: 'Maximum tokens in response (default: 2048)'
          },
          temperature: {
            type: 'number',
            description: 'Temperature setting for response generation (0-1, default: 0.7)'
          }
        },
        required: ['message']
      }
    };
  }

  /**
   * Process tool call from Claude
   */
  async processTool(input: any) {
    try {
      const taskCategory = input.task_type || this.detectTaskCategory(input.message);

      const request: AIRequest = {
        prompt: input.message,
        taskCategory: this.mapToTaskCategory(taskCategory),
        maxTokens: input.max_tokens || 2048,
        temperature: input.temperature || 0.7
      };

      const response = await this.connector.executeRequest(request);

      return {
        type: 'success',
        content: response.content,
        usage: {
          tokens: response.tokensUsed,
          cost: `$${response.cost.toFixed(4)}`
        },
        provider: response.provider,
        latency_ms: response.latency
      };
    } catch (error) {
      return {
        type: 'error',
        error: (error as Error).message,
        message: 'Failed to process through AI Connector. Retrying with available providers...'
      };
    }
  }

  /**
   * Get connector status for Claude context
   */
  async getConnectorStatus() {
    const status = this.connector.getRateLimitStatus();
    const metrics = this.connector.getMetrics();

    return {
      providers: status.map(s => ({
        name: s.provider,
        available: !s.isLimited,
        usage: `${s.requestsUsed}/${s.requestsLimit}`,
        next_reset: s.resetTime.toISOString()
      })),
      performance: {
        total_requests: metrics.totalRequests,
        avg_cost: `$${metrics.averageCost.toFixed(4)}`,
        avg_latency_ms: metrics.averageLatency.toFixed(2)
      }
    };
  }

  /**
   * Recommend provider based on current state
   */
  async recommendProvider(taskType: string) {
    const category = this.mapToTaskCategory(taskType);
    const status = this.connector.getRateLimitStatus();
    const available = status.filter(s => !s.isLimited);

    if (available.length === 0) {
      return {
        recommendation: 'All providers are rate-limited. Please wait for reset.',
        next_available: status[0].resetTime.toISOString()
      };
    }

    return {
      recommendation: `Recommended for ${category}: ${available[0].provider}`,
      available_providers: available.map(a => a.provider)
    };
  }

  private detectTaskCategory(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('code') || lowerMessage.includes('function')) return 'code_generation';
    if (lowerMessage.includes('analyze') || lowerMessage.includes('summarize')) return 'text_analysis';
    if (lowerMessage.includes('creative') || lowerMessage.includes('story')) return 'creative_writing';
    if (lowerMessage.includes('reason') || lowerMessage.includes('explain')) return 'reasoning';
    if (lowerMessage.includes('process') || lowerMessage.includes('data')) return 'data_processing';

    return 'general';
  }

  private mapToTaskCategory(categoryString: string): TaskCategory {
    const mapping: Record<string, TaskCategory> = {
      'code_generation': TaskCategory.CODE_GENERATION,
      'text_analysis': TaskCategory.TEXT_ANALYSIS,
      'creative_writing': TaskCategory.CREATIVE_WRITING,
      'data_processing': TaskCategory.DATA_PROCESSING,
      'reasoning': TaskCategory.REASONING,
      'image_generation': TaskCategory.IMAGE_GENERATION,
      'general': TaskCategory.GENERAL
    };

    return mapping[categoryString] || TaskCategory.GENERAL;
  }
}
