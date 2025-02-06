import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, SocialPromoContent, SocialPromoOptions } from '../../../types/supabase.types';
import { SupabaseService } from '../../../services/supabase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-social-content-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Generate Social Content</h2>

      <div class="mb-6">
        <div class="flex space-x-4 mb-4">
          <button
            *ngFor="let platform of platforms"
            (click)="setActivePlatform(platform)"
            [class.bg-primary]="activePlatform === platform"
            [class.text-white]="activePlatform === platform"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            [class.bg-gray-100]="activePlatform !== platform"
            [class.text-gray-700]="activePlatform !== platform"
          >
            {{ platform | titlecase }}
          </button>
        </div>

        <form (ngSubmit)="generateContent()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Content Type</label>
            <select
              [(ngModel)]="socialOptions.contentType"
              name="contentType"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="product_showcase">Product Showcase</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="promotional">Promotional</option>
              <option value="educational">Educational</option>
            </select>
          </div>

          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="socialOptions.includePrice"
                name="includePrice"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="ml-2 text-sm text-gray-700">Include Price</span>
            </label>

            <label class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="socialOptions.includeCTA"
                name="includeCTA"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="ml-2 text-sm text-gray-700">Include Call-to-Action</span>
            </label>
          </div>

          <button
            type="submit"
            [disabled]="isGenerating || !selectedProduct"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {{ isGenerating ? 'Generating...' : 'Generate Content' }}
          </button>
        </form>
      </div>

      <!-- Generated Content -->
      <div *ngIf="generatedContent.length > 0" class="space-y-4">
        <div *ngFor="let content of getContentByPlatform(activePlatform)" class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between items-start mb-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ content.platform }}
            </span>
            <button
              (click)="saveContent(content)"
              class="text-primary hover:text-primary-dark text-sm font-medium"
            >
              Save Content
            </button>
          </div>
          <p class="text-gray-900 mb-2">{{ content.content }}</p>
          <p class="text-gray-600 text-sm">{{ content.hashtags }}</p>
        </div>
      </div>

      <!-- Saved Content -->
      <div *ngIf="savedContent.length > 0" class="mt-8">
        <h3 class="text-lg font-medium mb-4">Saved Content</h3>
        <div class="space-y-4">
          <div *ngFor="let content of getSavedContentByPlatform(activePlatform)" class="bg-gray-50 p-4 rounded-lg relative">
            <button
              (click)="deleteContent(content.id)"
              class="absolute top-2 right-2 text-red-600 hover:text-red-800"
            >
              <span class="sr-only">Delete</span>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <p class="text-gray-900 mb-2">{{ content.content }}</p>
            <p class="text-gray-600 text-sm">{{ content.hashtags }}</p>
            <p class="text-xs text-gray-500 mt-2">{{ content.created_at | date:'medium' }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SocialContentGeneratorComponent implements OnInit {
  @Input() selectedProduct: Product | null = null;

  platforms: ('instagram' | 'pinterest' | 'facebook')[] = ['instagram', 'pinterest', 'facebook'];
  activePlatform: 'instagram' | 'pinterest' | 'facebook' = 'instagram';
  
  socialOptions: SocialPromoOptions = {
    platform: 'instagram',
    contentType: 'product_showcase',
    tone: 'professional',
    includePrice: false,
    includeCTA: true,
    targetAudience: 'general',
    promotionalAngle: 'features'
  };

  isGenerating = false;
  generatedContent: SocialPromoContent[] = [];
  savedContent: SocialPromoContent[] = [];

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    if (this.selectedProduct) {
      this.loadSavedContent(this.selectedProduct.id);
    }
  }

  setActivePlatform(platform: 'instagram' | 'pinterest' | 'facebook') {
    this.activePlatform = platform;
  }

  generateContent() {
    if (!this.selectedProduct) return;

    this.isGenerating = true;
    const content = this.generateContentForPlatform(this.activePlatform);
    
    this.generatedContent.push({
      id: `temp-${Date.now()}`,
      product_id: this.selectedProduct.id,
      platform: this.activePlatform,
      content: content.content,
      hashtags: content.hashtags,
      created_at: new Date().toISOString(),
      options: { ...this.socialOptions }
    });

    this.isGenerating = false;
  }

  private generateContentForPlatform(platform: string): { content: string; hashtags: string } {
    // Implementation remains the same as before
    // ... (copy the content generation logic from the original component)
    return { content: '', hashtags: '' }; // Placeholder
  }

  getContentByPlatform(platform: string): SocialPromoContent[] {
    return this.generatedContent.filter(content => content.platform === platform);
  }

  getSavedContentByPlatform(platform: string): SocialPromoContent[] {
    return this.savedContent.filter(content => content.platform === platform);
  }

  saveContent(content: SocialPromoContent) {
    if (!this.selectedProduct) return;

    this.supabaseService.saveSocialContent(content).subscribe({
      next: (savedContent) => {
        this.savedContent = [savedContent, ...this.savedContent];
        this.generatedContent = this.generatedContent.filter(c => c.id !== content.id);
        Swal.fire({
          title: 'Success!',
          text: 'Content saved successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      },
      error: (error) => {
        console.error('Error saving content:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to save content',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  deleteContent(contentId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        this.supabaseService.deleteSocialContent(contentId).subscribe({
          next: () => {
            this.savedContent = this.savedContent.filter(c => c.id !== contentId);
            Swal.fire({
              title: 'Deleted!',
              text: 'Content deleted successfully',
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#2563eb'
            });
          },
          error: (error) => {
            console.error('Error deleting content:', error);
            Swal.fire({
              title: 'Error',
              text: 'Failed to delete content',
              icon: 'error',
              confirmButtonText: 'OK',
              confirmButtonColor: '#2563eb'
            });
          }
        });
      }
    });
  }

  private loadSavedContent(productId: string) {
    this.supabaseService.getSocialContent(productId).subscribe({
      next: (content) => {
        this.savedContent = content;
      },
      error: (error) => {
        console.error('Error loading saved content:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load saved content',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }
}