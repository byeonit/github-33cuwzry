import { AIProvider, SocialPromoContent, SocialPromoOptions } from "../../../types";

export interface SocialContentState {
  providers: AIProvider[];
  selectedProvider: AIProvider | null;
  platforms: ('instagram' | 'pinterest' | 'facebook')[];
  activePlatform: 'instagram' | 'pinterest' | 'facebook';
  socialOptions: SocialPromoOptions;
  isGenerating: boolean;
  isSaving: boolean;
  generatedContent: SocialPromoContent[];
  savedContent: SocialPromoContent[];
}

export interface ToastConfig {
  title: string;
  icon: 'success' | 'error' | 'warning' | 'info';
  timer?: number;
}