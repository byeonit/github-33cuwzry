import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { AIService } from '../../../services/ai.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { AIProvider, GeneratedImage, ImageGenerationOptions, Product } from '../../../types';
import { PinterestBoardsProvider } from '../../../types/product-provider.interface';
import { ProductSettingsService } from '../../../services/product-settings.service';

@Component({
  selector: 'app-image-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-start mb-6">
        <h2 class="text-xl font-semibold">Generate Product Images</h2>
        <button
          (click)="showProviderSelector()"
          class="text-gray-500 hover:text-primary transition-colors"
          title="Select AI Provider"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <!-- Selected AI Provider Info -->
      <div *ngIf="selectedProvider" class="mb-6 bg-blue-50 p-4 rounded-lg">
        <div class="flex justify-between items-center">
          <div>
            <h4 class="font-medium text-blue-900">Selected AI Provider</h4>
            <p class="text-sm text-blue-700">{{ selectedProvider.provider | titlecase }}</p>
          </div>
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            [class.bg-green-100]="selectedProvider.is_active"
            [class.text-green-800]="selectedProvider.is_active"
            [class.bg-red-100]="!selectedProvider.is_active"
            [class.text-red-800]="!selectedProvider.is_active"
          >
            {{ selectedProvider.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>

      <form (ngSubmit)="generateImage()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Platform</label>
          <select
            [(ngModel)]="imageOptions.platform"
            name="platform"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            <option value="instagram">Instagram</option>
            <option value="pinterest">Pinterest</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Style</label>
          <select
            [(ngModel)]="imageOptions.style"
            name="style"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            <option value="realistic">Realistic</option>
            <option value="artistic">Artistic</option>
            <option value="minimalist">Minimalist</option>
            <option value="vintage">Vintage</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Aspect Ratio</label>
          <select
            [(ngModel)]="imageOptions.aspectRatio"
            name="aspectRatio"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            <option *ngFor="let ratio of aspectRatios" [value]="ratio">{{ ratio }}</option>
          </select>
        </div>

        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="imageOptions.includeTitle"
              name="includeLogo"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span class="ml-2 text-sm text-gray-700">Include Title</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="imageOptions.includeSeoText"
              name="includeText"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span class="ml-2 text-sm text-gray-700">Include Seo Text</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="imageOptions.includeHashTags"
              name="includeHashTags"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span class="ml-2 text-sm text-gray-700">Include Hash Tags</span>
          </label>

        </div>

        <button
          type="submit"
          [disabled]="isGenerating || !selectedProduct || !selectedProvider"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {{ isGenerating ? 'Generating...' : 'Generate Image' }}
        </button>
      </form>

      <!-- Generated Image Preview -->
      <div *ngIf="generatedImage" class="mt-6">
        <h3 class="text-lg font-medium mb-4">Generated Image</h3>
        <div class="bg-gray-50 p-4 rounded-lg">
          <div>
            <div>
              <label for="title" class="text-sm text-gray-600 mt-1">Generated Title : </label>
              <input id="title"  
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                [(ngModel)]="generatedImage.title" 
                placeholder="Enter your title"/>
            </div>
            <div>
              <label for="seoText" class="text-sm text-gray-600 mt-1">Generated Seo text : </label>
              <textarea
                [(ngModel)]="generatedImage.seoText"
                name="seoText"
                rows="4"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"                
              ></textarea>
            </div>
            <div>
              <label for="hashtags" class="text-sm text-gray-600 mt-1">Generated hashTags : </label>
              <input id="hashtags" 
                [(ngModel)]="generatedImage.hashTags"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Enter HashTags"/>
            </div>
          </div>
          <br/>
          <img [src]="generatedImage.image_url" alt="Generated product image" class="w-full rounded-lg shadow-sm" />
          <div class="mt-4 flex justify-end">
          <button
              (click)="showProductProvidersSelector()"
              class="text-gray-500 hover:text-primary transition-colors"
              title="Select AI Provider"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              (click)="saveImage()"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Save Image
            </button>
          </div>
        </div>

      <!-- Selected AI Provider Info -->
      <div *ngIf="selectedProductProviders" class="mb-6 bg-blue-50 p-4 rounded-lg">
        <div class="flex justify-between items-center">
          <div>
            <h4 class="font-medium text-blue-900">Selected AI Provider</h4>
            <p class="text-sm text-blue-700">{{ selectedProductProviders.name | titlecase }}</p>
          </div>
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            [class.bg-green-100]="selectedProductProviders.board_id"
            [class.text-green-800]="selectedProductProviders.board_id"
          >
            {{ selectedProductProviders.board_id}}
          </span>
        </div>
      </div>


      </div>

      <!-- Saved Images -->
      <div *ngIf="savedImages.length > 0" class="mt-8">
        <h3 class="text-lg font-medium mb-4">Saved Images</h3>
        <div class="grid grid-cols-3 gap-4">
          <div *ngFor="let image of savedImages" class="relative">
            <div>
              <h3 class="font-medium text-gray-900">Title : {{ image.title}}</h3>
              <textarea class="text-sm text-gray-600 mt-1">Seo text : {{ image.seoText }}</textarea>
              <p class="text-sm text-gray-600 mt-1">hashTags : {{ image.hashTags }}</p>
              <p class="text-sm text-gray-600 mt-1">target_board_id : {{ image.target_board_id }}</p>
            </div>
            <br/>
            <img [src]="image.image_url" alt="Saved product image" class="w-full rounded-lg shadow-sm" />
            <button
              (click)="deleteImage(image.id)"
              class="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>


          </div>


        </div>
      </div>
    </div>
  `
})
export class ImageGeneratorComponent implements OnInit {
  @Input() selectedProduct: Product | null = null;

  providers: AIProvider[] = [];
  productProviders: PinterestBoardsProvider[] = [];

  selectedProvider: AIProvider | null = null;
  selectedProductProviders: PinterestBoardsProvider | null = null;

  imageOptions: ImageGenerationOptions = {
    platform: 'instagram',
    style: 'realistic',
    mood: 'bright',
    composition: 'product_only',
    background: 'plain',
    colorScheme: 'brand_colors',
    includeTitle: true,
    includeSeoText: true,
    includeHashTags: true,
    aspectRatio: '1:1'
  };

  aspectRatios: ('1:1' | '4:5' | '16:9' | '9:16')[] = ['1:1', '4:5', '16:9', '9:16'];
  isGenerating = false;
  generatedImage: GeneratedImage | null = null;
  savedImages: GeneratedImage[] = [];

  constructor(
    private productService: ProductService,
    private aiService: AIService,
    private authService: AuthService,
    private productSettingsService: ProductSettingsService
  ) {}

  ngOnInit() {
    if (this.selectedProduct) {
      this.loadSavedImages(this.selectedProduct.id);
      this.loadAIProviders();
      this.loadProductProviders();
    }
  }

  loadAIProviders() {
    this.aiService.getAIProviders().subscribe({
      next: (providers) => {
        this.providers = providers.filter(p => p.is_active);
        if (this.providers.length > 0) {
          this.selectedProvider = this.providers[0];
        }
      },
      error: (error) => {
        console.error('Error loading AI providers:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load AI providers',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  loadProductProviders() {
    this.productSettingsService.getPinterestBoardsProviders().subscribe({
      next: (productProviders) => {
        this.productProviders = productProviders;
        console.error('loading productProviders:', productProviders);
        if (this.productProviders.length > 0) {
          this.selectedProductProviders = this.productProviders[0];
        }
      },
      error: (error) => {
        console.error('Error loading product Providers:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load product Providers',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  async showProductProvidersSelector() {
    if (this.productProviders.length === 0) {
      Swal.fire({
        title: 'No Active productProviders',
        text: 'Please configure and activate productProviders.',
        icon: 'warning',
        confirmButtonText: 'Go to Settings',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#2563eb',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/ai-settings';
        }
      });
      return;
    }

    const productProvidersOptions = this.productProviders
    .filter(p => p.board_id && p.name) // Ensure valid values
    .map(p => ({
      value: p.board_id,
      text: `${p.name}`.trim() // Remove extra spaces
    }));
    
    console.log("Dropdown options: ", productProvidersOptions);

    const { value: boardId } = await Swal.fire({
      title: 'Select product board Provider',
      input: 'select',
      inputOptions: Object.fromEntries(productProvidersOptions.map(p => [p.value, p.text])),
      inputValue: this.selectedProductProviders?.board_id,
      showCancelButton: true,
      confirmButtonText: 'Select',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select an board';
        }
        return null;
      }
    });

    if (boardId) {
      console.log("this.selectedproductProviders boardId = " + boardId);

      //const parsedBoardId = Number(boardId); // Ensure it's a number
      //console.log("Parsed boardId = ", parsedBoardId);

      console.log("this.selectedproductProviders  before  = " + this.selectedProductProviders);
   
      this.selectedProductProviders = this.productProviders.find(
        p =>  p.board_id === boardId
      ) || null;

      console.log("this.selectedproductProviders  after  = " + this.selectedProductProviders);
   
    }
  }

  async showProviderSelector() {
    if (this.providers.length === 0) {
      Swal.fire({
        title: 'No Active Providers',
        text: 'Please configure and activate AI providers in the AI Settings page.',
        icon: 'warning',
        confirmButtonText: 'Go to Settings',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#2563eb',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/ai-settings';
        }
      });
      return;
    }

    const providerOptions = this.providers.map(p => ({
      value: p.id,
      text: `${p.provider.toUpperCase()} ${p.settings?.['model'] ? `(${p.settings['model']})` : ''}`
    }));

    const { value: providerId } = await Swal.fire({
      title: 'Select AI Provider',
      input: 'select',
      inputOptions: Object.fromEntries(providerOptions.map(p => [p.value, p.text])),
      inputValue: this.selectedProvider?.id,
      showCancelButton: true,
      confirmButtonText: 'Select',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select an AI provider';
        }
        return null;
      }
    });

    if (providerId) {
      this.selectedProvider = this.providers.find(p => p.id === providerId) || null;
    }
  }

  generateImage() {
    if (!this.selectedProduct || !this.selectedProvider) return;

    this.isGenerating = true;

    // Get current user
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user) {
          Swal.fire({
            title: 'Error',
            text: 'You must be logged in to generate images',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb'
          });
          this.isGenerating = false;
          return;
        }

        // Simulated image generation
        setTimeout(() => {
          const generatedImage: GeneratedImage = {
            id: crypto.randomUUID(),
            product_id: this.selectedProduct!.id,
            user_id: user.id, // Include user_id
            platform: this.imageOptions.platform,
            image_url: 'https://picsum.photos/800/800',
            prompt: `Generate a ${this.imageOptions.style} product image for ${this.selectedProduct!.name}`,
            options: { ...this.imageOptions },
            created_at: new Date().toISOString()
          };

          this.generatedImage = generatedImage;
          this.isGenerating = false;

          Swal.fire({
            title: 'Success!',
            text: 'Image generated successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb'
          });
        }, 2000);
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.isGenerating = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to generate image',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  saveImage() {
    if (!this.generatedImage || !this.selectedProduct) return;

    this.generatedImage.target_board_id = this.selectedProductProviders?.board_id;

    this.productService.saveGeneratedImage(this.generatedImage).subscribe({
      next: (savedImage) => {
        this.savedImages = [savedImage, ...this.savedImages];
        this.generatedImage = null;
        Swal.fire({
          title: 'Success!',
          text: 'Image saved successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      },
      error: (error) => {
        console.error('Error saving image:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to save image',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  deleteImage(imageId: string) {
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
        this.productService.deleteGeneratedImage(imageId).subscribe({
          next: () => {
            this.savedImages = this.savedImages.filter(img => img.id !== imageId);
            Swal.fire({
              title: 'Deleted!',
              text: 'Image deleted successfully',
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#2563eb'
            });
          },
          error: (error) => {
            console.error('Error deleting image:', error);
            Swal.fire({
              title: 'Error',
              text: 'Failed to delete image',
              icon: 'error',
              confirmButtonText: 'OK',
              confirmButtonColor: '#2563eb'
            });
          }
        });
      }
    });
  }

  private loadSavedImages(productId: string) {
    this.productService.getGeneratedImages(productId).subscribe({
      next: (images) => {
        this.savedImages = images;
      },
      error: (error) => {
        console.error('Error loading saved images:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load saved images',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }
}