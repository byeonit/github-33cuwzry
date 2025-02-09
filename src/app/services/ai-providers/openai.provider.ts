import { Injectable } from '@angular/core';
import { AIProviderConfig, AIProviderService } from '../../types/ai-provider.types';
import { AIProviderForm } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class OpenAIProvider implements AIProviderService {
  getConfig(): AIProviderConfig {
    return {
      name: 'OpenAI',
      value: 'openai',
      label: 'OpenAI',
      description: 'Connect to OpenAI API for content generation',
      fields: [
        {
          name: 'api_key',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'sk-...',
          description: 'Your OpenAI API key'
        },
        {
          name: 'model',
          label: 'Model',
          type: 'text',
          required: false,
          defaultValue: 'gpt-4',
          description: 'The AI model to use (default: gpt-4)'
        }
      ]
    };
  }

  validateConfig(config: Partial<AIProviderForm>): boolean {
    return !!(config.api_key && config.api_key.startsWith('sk-'));
  }

  async testConnection(config: Partial<AIProviderForm>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.error?.message || 'Failed to connect to OpenAI API'
        };
      }

      return {
        success: true,
        message: 'Successfully connected to OpenAI API'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to OpenAI API'
      };
    }
  }
}