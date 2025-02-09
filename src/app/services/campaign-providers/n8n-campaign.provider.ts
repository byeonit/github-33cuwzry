import { Injectable } from '@angular/core';
import { CampaignProviderConfig, CampaignProviderService, CampaignProviderForm } from '../../types/interfaces/campaign-provider.interface';

@Injectable({
  providedIn: 'root'
})
export class N8nCampaignProvider implements CampaignProviderService {
  getConfig(): CampaignProviderConfig {
    return {
      name: 'n8n',
      value: 'n8n',
      label: 'n8n Webhook',
      description: 'Connect to n8n webhook node for campaign automation',
      fields: [
        {
          name: 'webhook_url',
          label: 'Webhook URL',
          type: 'url',
          required: true,
          placeholder: 'https://n8n.your-domain.com/webhook/...',
          description: 'The webhook URL from your n8n webhook node'
        },
        {
          name: 'auth_method',
          label: 'Authentication Method',
          type: 'select',
          required: true,
          defaultValue: 'none',
          options: [
            { value: 'none', label: 'None' },
            { value: 'basic', label: 'Basic Auth' },
            { value: 'header', label: 'Header Auth' },
            { value: 'jwt', label: 'JWT Auth' }
          ],
          description: 'Select the authentication method for your webhook'
        },
        {
          name: 'auth_user',
          label: 'Username',
          type: 'text',
          required: false,
          placeholder: 'Basic Auth username',
          description: 'Username for Basic Authentication',
          showIf: { field: 'auth_method', value: 'basic' }
        },
        {
          name: 'auth_pass',
          label: 'Password',
          type: 'password',
          required: false,
          placeholder: 'Basic Auth password',
          description: 'Password for Basic Authentication',
          showIf: { field: 'auth_method', value: 'basic' }
        },
        {
          name: 'auth_header_key',
          label: 'Header Key',
          type: 'text',
          required: false,
          placeholder: 'X-Auth-Token',
          description: 'Header key for Header Authentication',
          showIf: { field: 'auth_method', value: 'header' }
        },
        {
          name: 'auth_header_value',
          label: 'Header Value',
          type: 'password',
          required: false,
          placeholder: 'your-secret-token',
          description: 'Header value for Header Authentication',
          showIf: { field: 'auth_method', value: 'header' }
        },
        {
          name: 'jwt_token',
          label: 'JWT Token',
          type: 'password',
          required: false,
          placeholder: 'your-jwt-token',
          description: 'JWT token for JWT Authentication',
          showIf: { field: 'auth_method', value: 'jwt' }
        }
      ]
    };
  }

  validateConfig(config: Partial<CampaignProviderForm>): boolean {
    if (!config.webhook_url) return false;
    
    try {
      // Validate webhook URL
      new URL(config.webhook_url);
      
      // Ensure settings object exists
      const settings = config.settings || {};
      
      // Validate auth method
      const authMethod = settings['auth_method'] || 'none';
      
      switch (authMethod) {
        case 'basic':
          if (!settings['auth_user'] || !settings['auth_pass']) {
            return false;
          }
          break;
        case 'header':
          if (!settings['auth_header_key'] || !settings['auth_header_value']) {
            return false;
          }
          break;
        case 'jwt':
          if (!settings['jwt_token']) {
            return false;
          }
          break;
        case 'none':
          // No additional validation needed
          break;
        default:
          return false;
      }
      
      return true;
    } catch (error) {
      console.error('N8n campaign provider validation error:', error);
      return false;
    }
  }

  formatConfig(config: Partial<CampaignProviderForm>): Partial<CampaignProviderForm> {
    try {
      const formatted: Partial<CampaignProviderForm> = {
        provider: 'n8n',
        webhook_url: config.webhook_url?.replace(/\/$/, ''), // Remove trailing slash
        settings: {
          ...config.settings,
          auth_method: config.settings?.['auth_method'] ?? 'none', // Ensure default
          auth_user: config.settings?.['auth_user'] ?? '',
          auth_pass: config.settings?.['auth_pass'] ?? '',
          auth_header_key: config.settings?.['auth_header_key'] ?? '',
          auth_header_value: config.settings?.['auth_header_value'] ?? '',
          jwt_token: config.settings?.['jwt_token'] ?? '',
        },
      };
      
      // Ensure settings object is never undefined
      if (!formatted.settings) {
        formatted.settings = {};
      }
      
      // Add auth-specific settings based on method
      switch (formatted.settings['auth_method']) {
        case 'basic':
          formatted.settings['auth_user'] = config.settings?.['auth_user'];
          formatted.settings['auth_pass'] = config.settings?.['auth_pass'];
          break;
        case 'header':
          formatted.settings['auth_header_key'] = config.settings?.['auth_header_key'];
          formatted.settings['auth_header_value'] = config.settings?.['auth_header_value'];
          break;
        case 'jwt':
          formatted.settings['jwt_token'] = config.settings?.['jwt_token'];
          break;
      }

      return formatted;
    } catch (error) {
      console.error('Error formatting n8n campaign config:', error);
      throw error;
    }
  }

  async testConnection(config: Partial<CampaignProviderForm>): Promise<{ success: boolean; message: string }> {
    try {
      if (!config.webhook_url) {
        return {
          success: false,
          message: 'Webhook URL is required'
        };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add authentication headers based on method
      const authMethod = config.settings?.['auth_method'] || 'none';
      
      switch (authMethod) {
        case 'basic':
          if (config.settings?.['auth_user'] && config.settings?.['auth_pass']) {
            const authString = `${config.settings['auth_user']}:${config.settings['auth_pass']}`;
            headers['Authorization'] = `Basic ${btoa(authString)}`;
          }
          break;
        case 'header':
          if (config.settings?.['auth_header_key']) {
            headers[config.settings['auth_header_key']] = config.settings['auth_header_value'] || '';
          }
          break;
        case 'jwt':
          if (config.settings?.['jwt_token']) {
            headers['Authorization'] = `Bearer ${config.settings['jwt_token']}`;
          }
          break;
      }

      const response = await fetch(config.webhook_url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'test_connection'
        })
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to connect to n8n webhook: ${response.statusText}`
        };
      }

      return {
        success: true,
        message: 'Successfully connected to n8n webhook'
      };
    } catch (error) {
      console.error('N8n campaign test connection error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to n8n webhook'
      };
    }
  }
}