export interface SocialPromoOptions {
  platform: 'instagram' | 'pinterest' | 'facebook';
  contentType: 'product_showcase' | 'lifestyle' | 'promotional' | 'educational';
  tone: 'casual' | 'professional' | 'friendly' | 'luxury';
  includePrice: boolean;
  includeCTA: boolean;
  targetAudience: 'general' | 'young_adults' | 'professionals' | 'luxury_buyers';
  promotionalAngle: 'features' | 'benefits' | 'lifestyle' | 'value_proposition';
}

export interface SocialPromoContent {
  id: string;
  product_id: string;
  user_id: string; // Added user_id field
  platform: string;
  content: string;
  hashtags?: string;
  created_at: string;
  options: SocialPromoOptions;
}

export interface N8nWebhook {
  product: {
    name: string;
    description: string;
    price: number;
  };
  platform: 'instagram' | 'pinterest' | 'facebook';
  options: {
    contentType: 'product_showcase' | 'lifestyle' | 'promotional' | 'educational';
    tone: 'casual' | 'professional' | 'friendly' | 'luxury';
    targetAudience: 'general' | 'young_adults' | 'professionals' | 'luxury_buyers';
    includePrice: boolean;
    includeCTA: boolean;
  };
}