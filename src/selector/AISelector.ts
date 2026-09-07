import { AIProvider, TaskCategory, AICapabilities, ProviderConfig } from '../types/index.js';
import { PROVIDER_CAPABILITIES } from '../config/providers.js';

export class AISelector {
  private providers: ProviderConfig[];
  private taskWeights: Record<TaskCategory, Partial<Record<keyof AICapabilities, number>>> = {
    [TaskCategory.CODE_GENERATION]: { codeGeneration: 0.4, reasoning: 0.3, speed: 0.2, costEfficiency: 0.1 },
    [TaskCategory.REASONING]: { reasoning: 0.5, codeGeneration: 0.2, creativity: 0.1, costEfficiency: 0.2 },
    [TaskCategory.TEXT_ANALYSIS]: { reasoning: 0.3, creativity: 0.2, speed: 0.3, costEfficiency: 0.2 },
    [TaskCategory.CREATIVE_WRITING]: { creativity: 0.5, reasoning: 0.1, codeGeneration: 0.1, costEfficiency: 0.3 },
    [TaskCategory.DATA_PROCESSING]: { speed: 0.4, reasoning: 0.3, costEfficiency: 0.2, codeGeneration: 0.1 },
    [TaskCategory.IMAGE_GENERATION]: { creativity: 0.5, speed: 0.3, costEfficiency: 0.2, codeGeneration: 0 },
    [TaskCategory.GENERAL]: { reasoning: 0.25, codeGeneration: 0.25, creativity: 0.25, speed: 0.25 }
  };

  constructor(providers: ProviderConfig[]) {
    this.providers = providers.filter(p => p.enabled).sort((a, b) => a.priority - b.priority);
  }

  selectBestProvider(taskCategory: TaskCategory, availableOnly: boolean = true): ProviderConfig | null {
    let candidateProviders = this.providers;
    
    if (availableOnly) {
      candidateProviders = candidateProviders.filter(p => !this.isRateLimited(p.provider));
    }

    if (candidateProviders.length === 0) return null;

    const weights = this.taskWeights[taskCategory];
    let bestProvider = candidateProviders[0];
    let bestScore = -Infinity;

    for (const provider of candidateProviders) {
      let score = 0;
      for (const [capability, weight] of Object.entries(weights)) {
        const capValue = provider.capabilities[capability as keyof AICapabilities];
        score += (capValue || 0) * (weight || 0);
      }

      if (score > bestScore) {
        bestScore = score;
        bestProvider = provider;
      }
    }

    return bestProvider;
  }

  getPriorityOrder(taskCategory: TaskCategory): AIProvider[] {
    return this.providers
      .sort((a, b) => {
        const scoreA = this.calculateScore(a, taskCategory);
        const scoreB = this.calculateScore(b, taskCategory);
        return scoreB - scoreA;
      })
      .map(p => p.provider);
  }

  private calculateScore(provider: ProviderConfig, taskCategory: TaskCategory): number {
    const weights = this.taskWeights[taskCategory];
    let score = 0;

    for (const [capability, weight] of Object.entries(weights)) {
      const capValue = provider.capabilities[capability as keyof AICapabilities];
      score += (capValue || 0) * (weight || 0);
    }

    return score;
  }

  private isRateLimited(provider: AIProvider): boolean {
    const config = this.providers.find(p => p.provider === provider);
    return config ? config.rateLimit <= 0 : false;
  }
}
