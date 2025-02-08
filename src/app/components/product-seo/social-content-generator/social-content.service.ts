import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AIService } from '../../../services/ai.service';
import { ProductService } from '../../../services/product.service';
import { AIProvider, Product, SocialPromoContent, SocialPromoOptions } from '../../../types';

@Injectable({
  providedIn: 'root'
})
export class SocialContentService {
  constructor(
    private aiService: AIService,
    private productService: ProductService
  ) {}

  getAIProviders(): Observable<AIProvider[]> {
    return this.aiService.getAIProviders();
  }

  generateContent(
    provider: AIProvider,
    product: Product,
    options: SocialPromoOptions
  ): Observable<{ content: string; hashtags: string }> {
    return this.aiService.generateSocialContent(
      provider,
      product.name,
      product.description,
      product.price,
      options
    );
  }

  getSavedContent(productId: string): Observable<SocialPromoContent[]> {
    return this.productService.getSocialContent(productId);
  }

  saveContent(content: SocialPromoContent): Observable<SocialPromoContent> {
    return this.productService.saveSocialContent(content);
  }

  deleteContent(contentId: string): Observable<void> {
    return this.productService.deleteSocialContent(contentId);
  }
}