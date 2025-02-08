import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialPromoContent, GeneratedImage } from '../../../../types';

@Component({
  selector: 'app-content-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Social Content -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-4">Social Media Content</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            *ngFor="let content of socialContent"
            class="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
            [class.border-primary]="isContentSelected('social', content.id)"
            (click)="toggleContent('social', content.id)"
          >
            <div class="flex justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                        [class]="getPlatformClasses(content.platform)">
                    {{ content.platform }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">{{ content.content }}</p>
                <p class="mt-2 text-xs text-gray-400">{{ content.hashtags }}</p>
              </div>
              <div class="flex h-5 items-center ml-4">
                <input
                  type="checkbox"
                  [checked]="isContentSelected('social', content.id)"
                  (click)="$event.stopPropagation()"
                  (change)="toggleContent('social', content.id)"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Generated Images -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-4">Generated Images</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let image of generatedImages"
            class="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
            [class.border-primary]="isContentSelected('image', image.id)"
            (click)="toggleContent('image', image.id)"
          >
            <div class="aspect-w-1 aspect-h-1 mb-4">
              <img
                [src]="image.imageUrl"
                [alt]="image.prompt"
                class="object-cover rounded-lg"
              />
            </div>
            <div class="flex justify-between items-start">
              <div>
                <span class="px-2 py-1 text-xs font-medium rounded-full"
                      [class]="getPlatformClasses(image.platform)">
                  {{ image.platform }}
                </span>
                <p class="mt-2 text-sm text-gray-500 line-clamp-2">{{ image.prompt }}</p>
              </div>
              <div class="flex h-5 items-center">
                <input
                  type="checkbox"
                  [checked]="isContentSelected('image', image.id)"
                  (click)="$event.stopPropagation()"
                  (change)="toggleContent('image', image.id)"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty States -->
      <div *ngIf="socialContent.length === 0 && generatedImages.length === 0"
           class="text-center py-8">
        <p class="text-gray-500 mb-2">No content available</p>
        <p class="text-sm text-gray-400">
          Generate content for your products first
        </p>
      </div>
    </div>
  `
})
export class ContentSelectionComponent {
  @Input() socialContent: SocialPromoContent[] = [];
  @Input() generatedImages: GeneratedImage[] = [];
  @Input() selectedContent: { social: string[]; image: string[] } = { social: [], image: [] };
  @Output() selectedContentChange = new EventEmitter<{ social: string[]; image: string[] }>();

  isContentSelected(type: 'social' | 'image', id: string): boolean {
    return this.selectedContent[type].includes(id);
  }

  toggleContent(type: 'social' | 'image', id: string) {
    const currentSelection = this.selectedContent[type];
    const updatedSelection = this.isContentSelected(type, id)
      ? currentSelection.filter(contentId => contentId !== id)
      : [...currentSelection, id];

    this.selectedContentChange.emit({
      ...this.selectedContent,
      [type]: updatedSelection
    });
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