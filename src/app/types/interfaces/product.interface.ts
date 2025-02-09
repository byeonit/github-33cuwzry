export interface Product {
  id: string;
  created_at: string;
  name: string;
  description: string;
  price: number;
  user_id: string;
}

export interface ProductDescription {
  id: string;
  name: string;
  details: string;
  generated_description: string;
  tone: string;
  user_id: string;
  created_at: string;
}

export interface GeneratedImage {
  id: string;
  product_id: string;
  user_id: string; // Added user_id field
  platform: string;
  image_url: string;
  prompt: string;
  options: ImageGenerationOptions;
  created_at: string;
}

export interface ImageGenerationOptions {
  platform: 'instagram' | 'pinterest' | 'facebook' | 'whatsapp' | 'telegram' | 'tiktok';
  style: 'realistic' | 'artistic' | 'minimalist' | 'vintage' | 'modern' | 'luxury';
  mood: 'bright' | 'dark' | 'warm' | 'cool' | 'neutral';
  composition: 'product_only' | 'lifestyle' | 'in_use' | 'flat_lay';
  background: 'plain' | 'gradient' | 'contextual' | 'abstract';
  colorScheme: 'brand_colors' | 'monochromatic' | 'complementary' | 'warm_tones' | 'cool_tones';
  includeText: boolean;
  includeLogo: boolean;
  aspectRatio: '1:1' | '4:5' | '16:9' | '9:16';
}