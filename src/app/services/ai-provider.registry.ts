import { Injectable } from '@angular/core';
import { OpenAIProvider } from './ai-providers/openai.provider';
import { DeepAIProvider } from './ai-providers/deepai.provider';
import { OllamaProvider } from './ai-providers/ollama.provider';
import { N8nProvider } from './ai-providers/n8n.provider';
import { TrainingProvider } from './ai-providers/training.provider';
import { AIProviderConfig, AIProviderService } from '../types/ai-provider.types';

@Injectable({
  providedIn: 'root'
})
export class AIProviderRegistry {
  private providers: Map<string, AIProviderService>;

  constructor(
    private openAIProvider: OpenAIProvider,
    private deepAIProvider: DeepAIProvider,
    private ollamaProvider: OllamaProvider,
    private n8nProvider: N8nProvider,
    private trainingProvider: TrainingProvider
  ) {
    this.providers = new Map([
      ['openai', openAIProvider],
      ['deepai', deepAIProvider],
      ['ollama', ollamaProvider],
      ['n8n', n8nProvider],
      ['training', trainingProvider]
    ]);
  }

  getProviders(): AIProviderConfig[] {
    return Array.from(this.providers.values()).map(provider => provider.getConfig());
  }

  getProvider(name: string): AIProviderService | undefined {
    return this.providers.get(name);
  }

  validateProviderConfig(name: string, config: any): boolean {
    const provider = this.providers.get(name);
    return provider ? provider.validateConfig(config) : false;
  }

  formatProviderConfig(name: string, config: any): any {
    const provider = this.providers.get(name);
    return provider && provider.formatConfig ? provider.formatConfig(config) : config;
  }
}