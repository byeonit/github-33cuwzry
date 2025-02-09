import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, switchMap, delay } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AIProviderRegistry } from './ai-provider.registry';
import { AIProvider, AIProviderForm, N8nWebhook, SocialPromoOptions } from '../types';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private supabase = this.authService.getSupabaseClient();

  constructor(
    private authService: AuthService,
    private providerRegistry: AIProviderRegistry
  ) {}

  getAIProviders(): Observable<AIProvider[]> {
    return from(
      this.supabase
        .from("ai_providers")
        .select("*")
        .order("created_at", { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as AIProvider[];
      }),
      catchError((error) => {
        console.error("Error fetching AI providers:", error);
        return throwError(() => new Error("Failed to fetch AI providers"));
      })
    );
  }

  addAIProvider(provider: AIProviderForm): Observable<AIProvider> {
    return this.authService.getCurrentUser().pipe(
      map((user: User | null) => {
        if (!user) throw new Error("User not authenticated");
        return user;
      }),
      switchMap((user: User) => {
        const providerData = {
          ...provider,
          user_id: user.id,
          is_active: true,
        };

        return from(
          this.supabase
            .from("ai_providers")
            .insert([providerData])
            .select()
            .single()
        );
      }),
      map(({ data, error }) => {
        if (error) throw error;
        return data as AIProvider;
      }),
      catchError((error) => {
        console.error("Error adding AI provider:", error);
        return throwError(() => new Error("Failed to add AI provider"));
      })
    );
  }

  updateAIProvider(
    id: string,
    provider: Partial<AIProviderForm>
  ): Observable<AIProvider> {
    return from(
      this.supabase
        .from("ai_providers")
        .update(provider)
        .eq("id", id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as AIProvider;
      }),
      catchError((error) => {
        console.error("Error updating AI provider:", error);
        return throwError(() => new Error("Failed to update AI provider"));
      })
    );
  }

  deleteAIProvider(id: string): Observable<void> {
    return from(this.supabase.from("ai_providers").delete().eq("id", id)).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
      catchError((error) => {
        console.error("Error deleting AI provider:", error);
        return throwError(() => new Error("Failed to delete AI provider"));
      })
    );
  }

  testConnection(
    provider: AIProvider
  ): Observable<{ success: boolean; message: string }> {
    const providerService = this.providerRegistry.getProvider(
      provider.provider
    );
    if (!providerService) {
      return throwError(() => new Error("Provider service not found"));
    }

    return from(providerService.testConnection(provider));
  }
  
  generateSocialContent(
    provider: AIProvider,
    productName: string,
    productDescription: string,
    price: number,
    options: SocialPromoOptions
  ): Observable<{ content: string; hashtags: string }> {
    switch (provider.provider) {
      case 'training':
        return this.generateWithTraining(productName, productDescription, price, options);
      case 'n8n':
        if (!provider.webhook_url) {
          return throwError(() => new Error('Webhook URL is required for n8n provider'));
        }
        return this.generateWithN8n(provider, {
          product: {
            name: productName,
            description: productDescription,
            price: price
          },
          platform: options.platform,
          options: {
            contentType: options.contentType,
            tone: options.tone,
            targetAudience: options.targetAudience,
            includePrice: options.includePrice,
            includeCTA: options.includeCTA
          }
        });
      default:
        return throwError(() => new Error('Unsupported AI provider'));
    }
  }

  private generateWithTraining(
    productName: string,
    productDescription: string,
    price: number,
    options: SocialPromoOptions
  ): Observable<{ content: string; hashtags: string }> {
    // Simulate API delay
    const simulatedDelay = 1000;

    // Generate dummy content based on options
    const content = this.generateDummyContent(productName, productDescription, price, options);
    const hashtags = this.generateDummyHashtags(productName, options);

    return of({ content, hashtags }).pipe(
      delay(simulatedDelay)
    );
  }

  private generateDummyContent(
    productName: string,
    productDescription: string,
    price: number,
    options: SocialPromoOptions
  ): string {
    let content = '';
    
    switch (options.contentType) {
      case 'product_showcase':
        content = `✨ Introducing the amazing ${productName}! ${productDescription}`;
        break;
      case 'promotional':
        content = `🔥 Special offer! Get your ${productName} today`;
        break;
      case 'lifestyle':
        content = `Transform your life with ${productName}. ${productDescription}`;
        break;
      case 'educational':
        content = `Did you know? ${productName} helps you ${productDescription}`;
        break;
    }

    if (options.includePrice) {
      content += `\n\nPrice: $${price}`;
    }

    if (options.includeCTA) {
      content += '\n\nShop now! 🛍️';
    }

    return content;
  }

  private generateDummyHashtags(productName: string, options: SocialPromoOptions): string {
    const baseHashtags = [
      `#${productName.replace(/\s+/g, '')}`,
      `#${options.platform}`,
      `#${options.contentType}`,
      `#${options.tone}`
    ];

    const platformHashtags = {
      instagram: ['#instagood', '#instadaily', '#photooftheday'],
      facebook: ['#facebook', '#social', '#community'],
      pinterest: ['#pinterestinspired', '#pinterestideas', '#pinit']
    };

    return [...baseHashtags, ...platformHashtags[options.platform]].join(' ');
  }

  private generateWithN8n(
    provider: AIProvider,
    webhookData: N8nWebhook
  ): Observable<{ content: string; hashtags: string }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add authentication headers based on method
    const authMethod = provider.settings?.['auth_method'] || 'none';
    switch (authMethod) {
      case 'basic':
        if (provider.settings?.['auth_user'] && provider.settings?.['auth_pass']) {
          const authString = `${provider.settings['auth_user']}:${provider.settings['auth_pass']}`;
          headers['Authorization'] = `Basic ${btoa(authString)}`;
        }
        break;
      case 'header':
        if (provider.settings?.['auth_header_key']) {
          headers[provider.settings['auth_header_key']] = provider.settings['auth_header_value'] || '';
        }
        break;
      case 'jwt':
        if (provider.settings?.['jwt_token']) {
          headers['Authorization'] = `Bearer ${provider.settings['jwt_token']}`;
        }
        break;
    }

    return from(
      fetch(provider.webhook_url!, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookData)
      })
    ).pipe(
      switchMap(response => {
        if (!response.ok) {
          throw new Error('Failed to generate content');
        }
        return response.json();
      }),
      map(data => ({
        content: data.content,
        hashtags: data.hashtags
      })),
      catchError(error => {
        console.error('Error generating content:', error);
        throw new Error('Failed to generate content');
      })
    );
  }
}