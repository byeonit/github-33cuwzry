export interface AIProvider {
  id: string;
  user_id: string;
  provider: 'openai' | 'deepai' | 'ollama' | 'n8n' | 'training';
  api_key?: string;
  webhook_url?: string;
  base_url?: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIProviderForm {
  provider: 'openai' | 'deepai' | 'ollama' | 'n8n' | 'training';
  api_key?: string;
  webhook_url?: string;
  base_url?: string;
  headers?: string;
  model?: string;
  settings: Record<string, any>;
  is_active?: boolean;
  error_rate?: number;
}