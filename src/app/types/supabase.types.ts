// Add this interface to the existing file
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

// Keep all existing interfaces...