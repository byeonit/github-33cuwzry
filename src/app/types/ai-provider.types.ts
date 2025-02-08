import { AIProviderForm } from "./interfaces/ai-provider.interface";

export interface AIProviderConfig {
  name: string;
  value: string;
  label: string;
  icon?: string;
  fields: AIProviderField[];
  description?: string;
}

export interface AIProviderField {
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

export interface AIProviderService {
  getConfig(): AIProviderConfig;
  validateConfig(config: Partial<AIProviderForm>): boolean;
  formatConfig?(config: Partial<AIProviderForm>): Partial<AIProviderForm>;
  testConnection(config: Partial<AIProviderForm>): Promise<{ success: boolean; message: string }>;
}