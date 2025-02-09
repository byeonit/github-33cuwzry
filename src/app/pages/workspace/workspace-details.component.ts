import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { ProductService } from '../../services/product.service';
import { Product, SocialPromoContent, GeneratedImage } from '../../types';
import Swal from 'sweetalert2';
import { Workspace, WorkspaceProduct, WorkspaceContent, WorkspaceSchedule } from '../../types/interfaces/workspace.interface';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-workspace-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './workspace-details.component.html'
})
export class WorkspaceDetailsComponent implements OnInit {
  workspace: Workspace | null = null;
  products: Product[] = [];
  socialContent: SocialPromoContent[] = [];
  generatedImages: GeneratedImage[] = [];
  schedules: WorkspaceSchedule[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

  private async loadWorkspaceDetails(workspaceId: string) {
    this.isLoading = true;
    this.error = null;

    try {
      // First get the workspace details
      const workspace = await this.workspaceService.getWorkspaceById(workspaceId).toPromise();
      if (!workspace) {
        throw new Error('Workspace not found');
      }
      this.workspace = workspace;

      // Then load all related data in parallel
      const [products, content, schedules] = await Promise.all([
        this.workspaceService.getWorkspaceProducts(workspaceId).toPromise(),
        this.workspaceService.getWorkspaceContent(workspaceId).toPromise(),
        this.workspaceService.getWorkspaceSchedules(workspaceId).toPromise()
      ]);

      this.schedules = schedules;

      // Load product details
      if (products.length > 0) {
        const productIds = products.map((p: WorkspaceProduct) => p.product_id);
        this.products = await this.productService.getProductsByIds(productIds).toPromise() || [];
      }

      // Split content by type
      const socialContentIds = content
        .filter((c: WorkspaceContent) => c.content_type === 'social')
        .map((c: WorkspaceContent) => c.content_id);
      
      const imageContentIds = content
        .filter((c: WorkspaceContent) => c.content_type === 'image')
        .map((c: WorkspaceContent) => c.content_id);

      // Load social content
      if (socialContentIds.length > 0) {
        const socialContentResults = await Promise.all(
          socialContentIds.map((id: string) => 
            this.productService.getSocialContent(id).toPromise()
          )
        );
        
        this.socialContent = socialContentResults
          .flat()
          .filter((content): content is SocialPromoContent => content !== undefined);
      }

      // Load generated images
      if (imageContentIds.length > 0) {
        const imageResults = await Promise.all(
          imageContentIds.map((id: string) =>
            this.productService.getGeneratedImages(id).toPromise()
          )
        );
        
        this.generatedImages = imageResults
          .flat()
          .filter((image): image is GeneratedImage => image !== undefined);
      }

    } catch (error) {
      console.error('Error loading workspace details:', error);
      this.error = error instanceof Error ? error.message : 'Failed to load workspace details';
      this.showError(this.error);
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/workspace']);
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