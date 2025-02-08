import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { ProductService } from '../../services/product.service';
import { Product, SocialPromoContent, GeneratedImage } from '../../types';
import Swal from 'sweetalert2';
import { Workspace, WorkspaceProduct, WorkspaceSchedule } from '../../types/interfaces/workspace.interface';

@Component({
  selector: 'app-workspace-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div *ngIf="!isLoading && workspace">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">{{ workspace.name }}</h1>
                <p class="mt-2 text-sm text-gray-500">
                  Created {{ workspace.created_at | date:'medium' }}
                </p>
              </div>
              <div class="flex items-center space-x-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  [ngClass]="getStatusClasses(workspace.status)"
                >
                  {{ workspace.status | titlecase }}
                </span>
                <button
                  *ngIf="workspace.status === 'draft'"
                  (click)="launchCampaign()"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                >
                  Launch Campaign
                </button>
              </div>
            </div>
          </div>

          <!-- Content Sections -->
          <div class="space-y-6">
            <!-- Products -->
            <div class="bg-white shadow rounded-lg">
              <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 class="text-lg font-medium text-gray-900">Selected Products</h2>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    *ngFor="let product of products"
                    class="border rounded-lg p-4"
                  >
                    <h3 class="font-medium text-gray-900">{{ product.name }}</h3>
                    <p class="mt-1 text-sm text-gray-500">{{ product.description }}</p>
                    <p class="mt-2 text-sm font-medium text-primary">
                      {{ product.price | currency }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="bg-white shadow rounded-lg">
              <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 class="text-lg font-medium text-gray-900">Selected Content</h2>
              </div>
              <div class="p-6">
                <!-- Social Content -->
                <div *ngIf="socialContent.length > 0" class="mb-8">
                  <h3 class="text-md font-medium text-gray-700 mb-4">Social Media Content</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      *ngFor="let content of socialContent"
                      class="border rounded-lg p-4"
                    >
                      <div class="flex items-center space-x-2 mb-2">
                        <span
                          class="px-2 py-1 text-xs font-medium rounded-full"
                          [ngClass]="getPlatformClasses(content.platform)"
                        >
                          {{ content.platform }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-600">{{ content.content }}</p>
                      <p class="mt-2 text-xs text-gray-400">{{ content.hashtags }}</p>
                    </div>
                  </div>
                </div>

                <!-- Generated Images -->
                <div *ngIf="generatedImages.length > 0">
                  <h3 class="text-md font-medium text-gray-700 mb-4">Generated Images</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                      *ngFor="let image of generatedImages"
                      class="border rounded-lg p-4"
                    >
                      <img
                        [src]="image.imageUrl"
                        [alt]="image.prompt"
                        class="w-full h-48 object-cover rounded-lg mb-2"
                      />
                      <span
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        [ngClass]="getPlatformClasses(image.platform)"
                      >
                        {{ image.platform }}
                      </span>
                      <p class="mt-2 text-sm text-gray-500">{{ image.prompt }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Schedule -->
            <div class="bg-white shadow rounded-lg">
              <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 class="text-lg font-medium text-gray-900">Publication Schedule</h2>
              </div>
              <div class="p-6">
                <div class="space-y-6">
                  <div
                    *ngFor="let platform of getPlatforms()"
                    class="border-b pb-6 last:border-b-0 last:pb-0"
                  >
                    <h3 class="font-medium text-gray-900 mb-4">{{ platform | titlecase }}</h3>
                    <div class="space-y-4">
                      <div
                        *ngFor="let schedule of getSchedulesForPlatform(platform)"
                        class="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                      >
                        <div>
                          <p class="text-sm font-medium text-gray-900">
                            {{ schedule.scheduled_at | date:'medium' }}
                          </p>
                          <p class="mt-1 text-sm text-gray-500">
                            {{ getContentDescription(schedule.content_id) }}
                          </p>
                        </div>
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="getScheduleStatusClasses(schedule.status)"
                        >
                          {{ schedule.status | titlecase }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WorkspaceDetailsComponent implements OnInit {
  workspace: Workspace | null = null;
  products: Product[] = []; // We'll store the mapped Product[] here
  socialContent: SocialPromoContent[] = [];
  generatedImages: GeneratedImage[] = [];
  schedules: WorkspaceSchedule[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    const workspaceId = this.route.snapshot.paramMap.get('id');
    if (!workspaceId) {
      this.showError('Workspace ID is required');
      return;
    }

    this.loadWorkspaceDetails(workspaceId);
  }

  private loadWorkspaceDetails(workspaceId: string) {
    this.workspaceService.getWorkspaceById(workspaceId).subscribe({
      next: (workspace) => {
        this.workspace = workspace;
        //this.loadRelatedData(workspaceId);
        this.loadWorkspaceProducts(workspaceId);
      },
      error: (error) => {
        console.error('Error loading workspace:', error);
        this.showError('Failed to load campaign details');
        this.isLoading = false;
      }
    });
  }
  private loadWorkspaceProducts(workspaceId: string) {
    // Fetch workspace products (which will only have references to products)
    this.workspaceService.getWorkspaceProducts(workspaceId).subscribe({
      next: (workspaceProducts: WorkspaceProduct[]) => {
        // Map workspace products to full product details
        const productIds = workspaceProducts.map(wp => wp.product_id);
        
        // Fetch product details (you may need a method in ProductService to handle multiple product IDs)
        this.productService.getProductsByIds(productIds).subscribe({
          next: (products: Product[]) => {
            // Map the full product details to the component's product array
            this.products = products;
            this.isLoading = false;  // Done loading
          },
          error: (error) => {
            console.error('Error loading product details:', error);
            this.showError('Failed to load product details');
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading workspace products:', error);
        this.showError('Failed to load workspace products');
      }
    });
  }

/** To delete */
/*
  private loadRelatedData(workspaceId: string) {
    // Load products
    this.workspaceService.getWorkspaceProducts(workspaceId).subscribe({
      next: (products) => {
        this.products = products;
        this.loadContent(workspaceId);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.showError('Failed to load products');
      }
    });
  }
*/
  private loadContent(workspaceId: string) {
    // Load content and schedules
    this.workspaceService.getWorkspaceContent(workspaceId).subscribe({
      next: (content) => {
        // TODO: Load actual content based on content references
        this.loadSchedules(workspaceId);
      },
      error: (error) => {
        console.error('Error loading content:', error);
        this.showError('Failed to load content');
      }
    });
  }

  private loadSchedules(workspaceId: string) {
    this.workspaceService.getWorkspaceSchedules(workspaceId).subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading schedules:', error);
        this.showError('Failed to load schedules');
        this.isLoading = false;
      }
    });
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  getScheduleStatusClasses(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPlatforms(): string[] {
    return Array.from(new Set(this.schedules.map(s => s.platform)));
  }

  getSchedulesForPlatform(platform: string): WorkspaceSchedule[] {
    return this.schedules.filter(s => s.platform === platform);
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

  async launchCampaign() {
    if (!this.workspace) return;

    const result = await Swal.fire({
      title: 'Launch Campaign?',
      text: 'This will schedule all content for publication. Continue?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, launch it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb'
    });

    if (result.isConfirmed) {
      this.workspaceService.updateWorkspaceStatus(this.workspace.id, 'scheduled').subscribe({
        next: (updatedWorkspace) => {
          this.workspace = updatedWorkspace;
          Swal.fire({
            title: 'Success!',
            text: 'Campaign has been scheduled for publication',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb'
          });
        },
        error: (error) => {
          console.error('Error launching campaign:', error);
          this.showError('Failed to launch campaign');
        }
      });
    }
  }

  private showError(message: string) {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb'
    });
  }
}