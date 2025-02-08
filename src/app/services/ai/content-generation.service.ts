import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AIProvider, N8nWebhook, SocialPromoOptions } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class ContentGenerationService {
  generateSocialContent(
    provider: AIProvider,
    productName: string,
    productDescription: string,
    price: number,
    options: SocialPromoOptions
  ): Observable<{ content: string; hashtags: string }> {
    if (!provider.webhook_url && provider.provider === 'n8n') {
      return throwError(() => new Error('Webhook URL is required for n8n provider'));
    }

    switch (provider.provider) {
      case 'n8n':
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

  private generateWithN8n(
    provider: AIProvider,
    webhookData: N8nWebhook
  ): Observable<{ content: string; hashtags: string }> {
    const headers = this.buildHeaders(provider);

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

  private buildHeaders(provider: AIProvider): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

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

    return headers;
  }
}