import { Injectable } from '@angular/core';
import { AIProviderConfig, AIProviderService } from '../../types/ai-provider.types';
import { AIProviderForm } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class DeepAIProvider implements AIProviderService {
  getConfig(): AIProviderConfig {
    return {
      name: 'DeepAI',
      value: 'deepai',
      label: 'DeepAI',
      description: 'Connect to DeepAI for advanced AI capabilities',
      fields: [
        {
          name: 'api_key',
          label: 'API Key',
          type: 'password',
          required: true,
          placeholder: 'Enter your DeepAI API key',
          description: 'Your DeepAI API key'
        }
      ]
    };
  }

  validateConfig(config: Partial<AIProviderForm>): boolean {
    return !!config.api_key;
  }

  async testConnection(config: Partial<AIProviderForm>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.deepai.org/api/models', {
        headers: {
          'api-key': config.api_key || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Failed to connect to DeepAI API'
        };
      }

      return {
        success: true,
        message: 'Successfully connected to DeepAI API'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to DeepAI API'
      };
    }
  }
}