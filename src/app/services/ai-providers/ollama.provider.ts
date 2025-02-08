import { Injectable } from '@angular/core';
import { AIProviderConfig, AIProviderService } from '../../types/ai-provider.types';
import { AIProviderForm } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class OllamaProvider implements AIProviderService {
  getConfig(): AIProviderConfig {
    return {
      name: 'Ollama',
      value: 'ollama',
      label: 'Ollama',
      description: 'Connect to local Ollama instance',
      fields: [
        {
          name: 'base_url',
          label: 'Base URL',
          type: 'url',
          required: true,
          placeholder: 'http://localhost:11434',
          defaultValue: 'http://localhost:11434',
          description: 'Your Ollama instance URL'
        },
        {
          name: 'model',
          label: 'Model',
          type: 'text',
          required: false,
          defaultValue: 'llama2',
          description: 'The model to use (default: llama2)'
        }
      ]
    };
  }

  validateConfig(config: Partial<AIProviderForm>): boolean {
    return !!(config.base_url && config.base_url.startsWith('http'));
  }

  formatConfig(config: Partial<AIProviderForm>): Partial<AIProviderForm> {
    return {
      ...config,
      base_url: config.base_url?.replace(/\/$/, '') // Remove trailing slash
    };
  }

  async testConnection(config: Partial<AIProviderForm>): Promise<{ success: boolean; message: string }> {
    try {
      if (!config.base_url) {
        return {
          success: false,
          message: 'Base URL is required'
        };
      }

      const response = await fetch(`${config.base_url}/api/tags`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to connect to Ollama: ${response.statusText}`
        };
      }

      // Check if the specified model exists
      if (config.settings && config.settings['model']) {
        const modelResponse = await fetch(`${config.base_url}/api/show`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: config.settings['model']
          })
        });

        if (!modelResponse.ok) {
          return {
            success: false,
            message: `Connected to Ollama but model "${config.settings['model']}" not found`
          };
        }
      }

      return {
        success: true,
        message: 'Successfully connected to Ollama instance'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to Ollama instance'
      };
    }
  }
}