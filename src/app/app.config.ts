import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { OpenAIProvider } from './services/ai-providers/openai.provider';
import { DeepAIProvider } from './services/ai-providers/deepai.provider';
import { OllamaProvider } from './services/ai-providers/ollama.provider';
import { N8nProvider } from './services/ai-providers/n8n.provider';
import { TrainingProvider } from './services/ai-providers/training.provider';
import { AIProviderRegistry } from './services/ai-provider.registry';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    OpenAIProvider,
    DeepAIProvider,
    OllamaProvider,
    N8nProvider,
    TrainingProvider,
    AIProviderRegistry
  ]
};