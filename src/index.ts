import * as dotenv from 'dotenv';
import { ConnectorManager } from './manager/ConnectorManager.js';
import { TaskCategory } from './types/index.js';

dotenv.config();

// Main connector instance
export const connector = new ConnectorManager();

// Export types and interfaces
export * from './types/index.js';
export { ConnectorManager } from './manager/ConnectorManager.js';
export { AISelector } from './selector/AISelector.js';

// Example usage
async function demonstrateConnector() {
  try {
    console.log('🚀 AI Connector Initialized');
    
    // Example 1: Code Generation
    console.log('\n📝 Example 1: Code Generation Request');
    const codeResponse = await connector.executeRequest({
      prompt: 'Write a function to calculate factorial in Python',
      taskCategory: TaskCategory.CODE_GENERATION,
      maxTokens: 500,
      systemPrompt: 'You are an expert programmer. Provide clean, well-commented code.'
    });
    console.log(`Provider: ${codeResponse.provider}`);
    console.log(`Content: ${codeResponse.content.substring(0, 200)}...`);
    console.log(`Cost: $${codeResponse.cost.toFixed(4)}, Latency: ${codeResponse.latency}ms`);

    // Example 2: Check Rate Limits
    console.log('\n📊 Rate Limit Status:');
    const rateLimits = connector.getRateLimitStatus();
    rateLimits.forEach(status => {
      console.log(`${status.provider}: ${status.requestsUsed}/${status.requestsLimit} requests used`);
    });

    // Example 3: Get Metrics
    console.log('\n📈 Connector Metrics:');
    const metrics = connector.getMetrics();
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Average Cost: $${metrics.averageCost.toFixed(4)}`);
    console.log(`Average Latency: ${metrics.averageLatency.toFixed(2)}ms`);
    console.log('Provider Stats:', metrics.providerStats);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run example if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateConnector();
}
