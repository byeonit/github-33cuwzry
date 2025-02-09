import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AIProviderService } from './ai-provider.service';
import { ContentGenerationService } from './content-generation.service';
import { AIProvider, AIProviderForm, SocialPromoOptions } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  constructor(
    private providerService: AIProviderService,
    private contentGeneration: ContentGenerationService
  ) {}

  getAIProviders(): Observable<AIProvider[]> {
    return this.providerService.getAIProviders();
  }

  addAIProvider(provider: AIProviderForm): Observable<AIProvider> {
    return this.providerService.addAIProvider(provider);
  }

  updateAIProvider(id: string, provider: Partial<AIProviderForm>): Observable<AIProvider> {
    return this.providerService.updateAIProvider(id, provider);
  }

  deleteAIProvider(id: string): Observable<void> {
    return this.providerService.deleteAIProvider(id);
  }

  generateSocialContent(
    provider: AIProvider,
    productName: string,
    productDescription: string,
    price: number,
    options: SocialPromoOptions
  ): Observable<{ content: string; hashtags: string }> {
    return this.contentGeneration.generateSocialContent(
      provider,
      productName,
      productDescription,
      price,
      options
    );
  }
}