import { Injectable } from '@angular/core';
import { AIProviderConfig, AIProviderService } from '../../types/ai-provider.types';
import { AIProviderForm } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class TrainingProvider implements AIProviderService {
  getConfig(): AIProviderConfig {
    return {
      name: 'Training AI',
      value: 'training',
      label: 'Training AI',
      description: 'Simulated AI provider for testing and demonstrations',
      fields: [
        {
          name: 'api_key',
          label: 'API Key',
          type: 'text',
          required: true,
          defaultValue: 'training-key-123',
          description: 'Demo API key for training purposes'
        },
        {
          name: 'mode',
          label: 'Simulation Mode',
          type: 'text',
          required: true,
          defaultValue: 'optimistic',
          description: 'The simulation mode to use (optimistic, realistic, pessimistic)'
        },
        {
          name: 'delay',
          label: 'Response Delay (ms)',
          type: 'number',
          required: false,
          defaultValue: '1000',
          description: 'Simulated response delay in milliseconds'
        },
        {
          name: 'error_rate',
          label: 'Error Rate (%)',
          type: 'number',
          required: false,
          defaultValue: '0',
          description: 'Percentage chance of simulated errors (0-100)'
        }
      ]
    };
  }

  validateConfig(config: Partial<AIProviderForm>): boolean {
    // Validate required fields
    if (!config.api_key) return false;

    // Validate settings
    const settings = config.settings || {};
    const mode = settings['mode'] || 'optimistic';
    const delay = Number(settings['delay'] || 1000);
    const errorRate = Number(settings['error_rate'] || 0);
    
    const validModes = ['optimistic', 'realistic', 'pessimistic'];
    if (!validModes.includes(mode)) return false;
    
    if (isNaN(delay) || delay < 0) return false;
    if (isNaN(errorRate) || errorRate < 0 || errorRate > 100) return false;
    
    return true;
  }

  formatConfig(config: Partial<AIProviderForm>): Partial<AIProviderForm> {
    // Extract form data
    const { api_key = 'training-key-123', ...otherFields } = config;

    // Create formatted config matching database structure
    const formatted: Partial<AIProviderForm> = {
      provider: 'training',
      api_key,
      settings: {
        mode: otherFields.settings?.['mode'] || 'optimistic',
        delay: Number(otherFields.settings?.['delay'] || 1000),
        error_rate: Number(otherFields.settings?.['error_rate'] || 0)
      },
      is_active: true
    };

    return formatted;
  }

  async testConnection(config: Partial<AIProviderForm>): Promise<{ success: boolean; message: string }> {
    // Simulate API delay
    const delay = config.settings?.['delay'] || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Training provider always returns success
    return {
      success: true,
      message: 'Training AI provider is ready for simulated content generation'
    };
  }
}