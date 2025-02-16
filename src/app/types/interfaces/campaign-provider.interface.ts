export interface CampaignProvider {
  id: string;
  user_id: string;
  provider: 'n8n';
  //webhook_url?: string;
  webhook_url: string | "";
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CampaignProviderForm { 
  provider: 'n8n';
  webhook_url?: string;
  settings: Record<string, any>;
  is_active?: boolean;
}

export interface CampaignProviderConfig {
  name: string;
  value: string;
  label: string;
  icon?: string;
  fields: CampaignProviderField[];
  description?: string;
}

export interface CampaignProviderField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'number' | 'select';
  required: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  showIf?: { field: string; value: string };
  validation?: {
    pattern?: string;
    message?: string;
  };
}

export interface CampaignProviderService {
  getConfig(): CampaignProviderConfig;
  validateConfig(config: Partial<CampaignProviderForm>): boolean;
  formatConfig?(config: Partial<CampaignProviderForm>): Partial<CampaignProviderForm>;
  testConnection(config: Partial<CampaignProviderForm>): Promise<{ success: boolean; message: string }>;
}