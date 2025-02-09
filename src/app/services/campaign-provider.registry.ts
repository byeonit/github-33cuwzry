import { Injectable } from '@angular/core';
import { N8nCampaignProvider } from './campaign-providers/n8n-campaign.provider';
import { CampaignProviderConfig, CampaignProviderForm, CampaignProviderService } from '../types/interfaces/campaign-provider.interface';

@Injectable({
  providedIn: 'root'
})
export class CampaignProviderRegistry {
  private providers: Map<string, CampaignProviderService>;

  constructor(
    private n8nProvider: N8nCampaignProvider
  ) {
    this.providers = new Map([
      ['n8n', n8nProvider]
    ]);
  }

  getProviders(): CampaignProviderConfig[] {
    return Array.from(this.providers.values()).map(provider => provider.getConfig());
  }

  getProvider(name: string): CampaignProviderService | undefined {
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