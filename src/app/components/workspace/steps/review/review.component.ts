import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, SocialPromoContent, GeneratedImage } from '../../../../types';
import { WorkspaceForm } from '../../../../types/interfaces/workspace.interface';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Campaign Details -->
      <div class="bg-white rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Campaign Details</h3>
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Campaign Name</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ form.name }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Selected Products</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ getSelectedProducts().length }} products selected
            </dd>
          </div>
        </dl>
      </div>

      <!-- Selected Products -->
      <div class="bg-white rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Selected Products</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let product of getSelectedProducts()"
               class="border rounded-lg p-4">
            <h4 class="font-medium text-gray-900">{{ product.name }}</h4>
            <p class="mt-1 text-sm text-gray-500">{{ product.description }}</p>
            <p class="mt-2 text-sm font-medium text-primary">
              {{ product.price | currency }}
            </p>
          </div>
        </div>
      </div>

      <!-- Selected Content -->
      <div class="bg-white rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Selected Content</h3>
        
        <!-- Social Content -->
        <div *ngIf="getSelectedSocialContent().length > 0" class="mb-6">
          <h4 class="text-md font-medium text-gray-700 mb-3">Social Media Content</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let content of getSelectedSocialContent()"
                 class="border rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full"
                      [class]="getPlatformClasses(content.platform)">
                  {{ content.platform }}
                </span>
              </div>
              <p class="text-sm text-gray-600">{{ content.content }}</p>
              <p class="mt-2 text-xs text-gray-400">{{ content.hashtags }}</p>
            </div>
          </div>
        </div>

        <!-- Image Content -->
        <div *ngIf="getSelectedImages().length > 0">
          <h4 class="text-md font-medium text-gray-700 mb-3">Generated Images</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let image of getSelectedImages()"
                 class="border rounded-lg p-4">
              <img [src]="image.imageUrl"
                   [alt]="image.prompt"
                   class="w-full h-48 object-cover rounded-lg mb-2" />
              <span class="px-2 py-1 text-xs font-medium rounded-full"
                    [class]="getPlatformClasses(image.platform)">
                {{ image.platform }}
              </span>
              <p class="mt-2 text-sm text-gray-500">{{ image.prompt }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Summary -->
      <div class="bg-white rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Publication Schedule</h3>
        <div class="space-y-4">
          <div *ngFor="let platform of getPlatforms()"
               class="border-b pb-4 last:border-b-0 last:pb-0">
            <h4 class="font-medium text-gray-900 mb-2">{{ platform | titlecase }}</h4>
            <div class="space-y-2">
              <div *ngFor="let schedule of getSchedulesForPlatform(platform)"
                   class="text-sm">
                <span class="text-gray-500">
                  {{ schedule.scheduledAt | date:'medium' }}
                </span>
                <span class="mx-2">-</span>
                <span class="text-gray-900">
                  {{ getContentDescription(schedule.contentId) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReviewComponent {
  @Input() form!: WorkspaceForm;
  @Input() products: Product[] = [];
  @Input() socialContent: SocialPromoContent[] = [];
  @Input() generatedImages: GeneratedImage[] = [];

  getSelectedProducts(): Product[] {
    return this.products.filter(p => this.form.selectedProducts.includes(p.id));
  }

  getSelectedSocialContent(): SocialPromoContent[] {
    return this.socialContent.filter(c => this.form.selectedContent.social.includes(c.id));
  }

  getSelectedImages(): GeneratedImage[] {
    return this.generatedImages.filter(i => this.form.selectedContent.image.includes(i.id));
  }

  getPlatforms(): string[] {
    return Array.from(new Set(this.form.schedules.map(s => s.platform)));
  }

  getSchedulesForPlatform(platform: string) {
    return this.form.schedules.filter(s => s.platform === platform);
  }

  getContentDescription(contentId: string): string {
    const socialContent = this.socialContent.find(c => c.id === contentId);
    if (socialContent) {
      return socialContent.content.substring(0, 50) + '...';
    }

    const image = this.generatedImages.find(i => i.id === contentId);
    if (image) {
      return `Image: ${image.prompt.substring(0, 50)}...`;
    }

    return 'Content not found';
  }

  getPlatformClasses(platform: string): string {
    const baseClasses = 'bg-opacity-10';
    switch (platform.toLowerCase()) {
      case 'instagram':
        return `${baseClasses} bg-pink-500 text-pink-800`;
      case 'facebook':
        return `${baseClasses} bg-blue-500 text-blue-800`;
      case 'pinterest':
        return `${baseClasses} bg-red-500 text-red-800`;
      default:
        return `${baseClasses} bg-gray-500 text-gray-800`;
    }
  }
}