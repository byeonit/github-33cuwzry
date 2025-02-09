import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { WorkspaceService } from '../../../services/workspace.service';
import { ProductSelectionComponent } from '../steps/product-selection/product-selection.component';
import { ContentSelectionComponent } from '../steps/content-selection/content-selection.component';
import { ScheduleComponent } from '../steps/schedule/schedule.component';
import { ReviewComponent } from '../steps/review/review.component';
import { Product, SocialPromoContent, GeneratedImage } from '../../../types';
import Swal from 'sweetalert2';
import { WorkspaceForm } from '../../../types/interfaces/workspace.interface';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-workspace-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductSelectionComponent,
    ContentSelectionComponent,
    ScheduleComponent,
    ReviewComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <div *ngIf="!isLoading">
        <!-- Step 1: Campaign Details -->
        <div *ngIf="currentStep === 1">
          <div class="bg-white shadow-sm rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Campaign Details</h2>
            <div class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Campaign Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  [(ngModel)]="form.name"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="Enter campaign name"
                />
              </div>
              
              <app-product-selection
                [products]="products"
                [selectedProductId]="form.selectedProducts[0]"
                (selectedProductChange)="onProductSelectionChange($event)"
              />
            </div>
          </div>
        </div>

        <!-- Step 2: Content Selection -->
        <div *ngIf="currentStep === 2">
          <div class="bg-white shadow-sm rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Content Selection</h2>
            <app-content-selection
              [selectedProductId]="form.selectedProducts[0]"
              [selectedContent]="form.selectedContent"
              (selectedContentChange)="onContentSelectionChange($event)"
            />
          </div>
        </div>

        <!-- Step 3: Schedule -->
        <div *ngIf="currentStep === 3">
          <div class="bg-white shadow-sm rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Publication Schedule</h2>
            <app-schedule
              [socialContent]="selectedSocialContent"
              [generatedImages]="selectedGeneratedImages"
              [schedules]="form.schedules"
              (schedulesChange)="onSchedulesChange($event)"
            />
          </div>
        </div>

        <!-- Step 4: Review -->
        <div *ngIf="currentStep === 4">
          <app-review
            [form]="form"
            [products]="products"
            [socialContent]="selectedSocialContent"
            [generatedImages]="selectedGeneratedImages"
          />
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-6">
          <button
            *ngIf="currentStep > 1"
            (click)="previousStep()"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            *ngIf="currentStep < 4"
            (click)="nextStep()"
            [disabled]="!canProceed()"
            class="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            *ngIf="currentStep === 4"
            (click)="saveWorkspace()"
            [disabled]="isSaving || !canProceed()"
            class="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? 'Saving...' : 'Save Campaign' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class WorkspaceFormComponent implements OnInit, OnDestroy {
  currentStep = 1;
  isLoading = true;
  isSaving = false;
  
  // Data
  products: Product[] = [];
  selectedSocialContent: SocialPromoContent[] = [];
  selectedGeneratedImages: GeneratedImage[] = [];

  // Form state
  form: WorkspaceForm = {
    name: '',
    selectedProducts: [],
    selectedContent: {
      social: [],
      image: []
    },
    schedules: []
  };

  private destroy$ = new Subject<void>();
  private saveInProgress = false;

  constructor(
    private productService: ProductService,
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.isLoading = true;
    
    this.productService.getProducts()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (products) => {
          this.products = products;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.showError('Failed to load products');
        }
      });
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  nextStep() {
    if (this.canProceed() && this.currentStep < 4) {
      if (this.currentStep === 2) {
        this.loadSelectedContent();
      }
      this.currentStep++;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.form.name && this.form.selectedProducts.length === 1;
      case 2:
        return this.form.selectedContent.social.length > 0 || 
               this.form.selectedContent.image.length > 0;
      case 3:
        return this.form.schedules.length > 0;
      default:
        return true;
    }
  }

  onProductSelectionChange(productId: string) {
    this.form.selectedProducts = [productId];
  }

  onContentSelectionChange(selectedContent: { social: string[]; image: string[] }) {
    this.form.selectedContent = selectedContent;
  }

  onSchedulesChange(schedules: { platform: string; contentId: string; scheduledAt: string }[]) {
    this.form.schedules = schedules;
  }

  private loadSelectedContent() {
    if (!this.form.selectedProducts[0]) return;

    const productId = this.form.selectedProducts[0];

    if (this.form.selectedContent.social.length > 0) {
      this.productService.getSocialContent(productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (content) => {
            this.selectedSocialContent = content.filter(item => 
              this.form.selectedContent.social.includes(item.id)
            );
          },
          error: (error) => {
            console.error('Error loading social content:', error);
            this.showError('Failed to load social content');
          }
        });
    }

    if (this.form.selectedContent.image.length > 0) {
      this.productService.getGeneratedImages(productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (images) => {
            this.selectedGeneratedImages = images.filter(item =>
              this.form.selectedContent.image.includes(item.id)
            );
          },
          error: (error) => {
            console.error('Error loading generated images:', error);
            this.showError('Failed to load generated images');
          }
        });
    }
  }

  async saveWorkspace() {
    if (this.isSaving || this.saveInProgress) {
      return;
    }

    this.isSaving = true;
    this.saveInProgress = true;

    try {
      // Create workspace
      const workspace = await this.workspaceService.createWorkspace(this.form.name)
        .pipe(takeUntil(this.destroy$))
        .toPromise();
      
      if (!workspace) throw new Error('Failed to create workspace');

      // Add product
      await this.workspaceService.addProductToWorkspace(
        workspace.id, 
        this.form.selectedProducts[0]
      )
      .pipe(takeUntil(this.destroy$))
      .toPromise();

      // Add content
      await Promise.all([
        ...this.form.selectedContent.social.map(contentId =>
          this.workspaceService.addContentToWorkspace(workspace.id, 'social', contentId)
            .pipe(takeUntil(this.destroy$))
            .toPromise()
        ),
        ...this.form.selectedContent.image.map(contentId =>
          this.workspaceService.addContentToWorkspace(workspace.id, 'image', contentId)
            .pipe(takeUntil(this.destroy$))
            .toPromise()
        )
      ]);

      // Add schedules
      await Promise.all(
        this.form.schedules.map(schedule =>
          this.workspaceService.createSchedule(
            workspace.id,
            schedule.platform,
            schedule.contentId,
            schedule.scheduledAt
          )
          .pipe(takeUntil(this.destroy$))
          .toPromise()
        )
      );

      await Swal.fire({
        title: 'Success!',
        text: 'Campaign workspace has been created successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb'
      });

      // Navigate to workspace list
      this.router.navigate(['/workspace']);

    } catch (error) {
      console.error('Error saving workspace:', error);
      this.showError('Failed to save campaign workspace');
    } finally {
      this.isSaving = false;
      this.saveInProgress = false;
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