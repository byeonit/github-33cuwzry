import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { ProductService } from '../../services/product.service';
import { Product, SocialPromoContent, GeneratedImage } from '../../types';
import Swal from 'sweetalert2';
import { Workspace, WorkspaceProduct, WorkspaceContent, WorkspaceSchedule } from '../../types/interfaces/workspace.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-workspace-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  async ngOnInit() {
    const workspaceId = this.route.snapshot.paramMap.get('id');
    if (!workspaceId) {
      this.showError('Workspace ID is required');
      return;
    }
    await this.loadWorkspaceDetails(workspaceId);
  }

  private async loadWorkspaceDetails(workspaceId: string) {
    this.isLoading = true;
    this.error = null;

    try {
      const workspace = await firstValueFrom(this.workspaceService.getWorkspaceById(workspaceId));

console.log("loadWorkspaceDetails workspace "  + workspace);

      if (!workspace) throw new Error('Workspace not found');
      this.workspace = workspace;

      const [products, content = [], schedules] = await Promise.all([
        firstValueFrom(this.workspaceService.getWorkspaceProducts(workspaceId)),
        firstValueFrom(this.workspaceService.getWorkspaceContent(workspaceId)),
        firstValueFrom(this.workspaceService.getWorkspaceSchedules(workspaceId))
      ]);
      
      this.schedules = schedules || [];

      if (products.length > 0) {
        const productIds = products.map((p: WorkspaceProduct) => p.product_id);
        this.products = await firstValueFrom(this.productService.getProductsByIds(productIds)) || [];
      }

      const socialContentIds = content.filter(c => c.content_type === 'social').map(c => c.content_id);
      const imageContentIds = content.filter(c => c.content_type === 'image').map(c => c.content_id);

      if (socialContentIds.length > 0) {
        const socialContentResults = await Promise.all(
          socialContentIds.map(id => firstValueFrom(this.productService.getSocialContent(id)))
        );
        this.socialContent = socialContentResults.flat().filter(Boolean);
      }

      if (imageContentIds.length > 0) {
        const imageResults = await Promise.all(
          imageContentIds.map(id => firstValueFrom(this.productService.getGeneratedImages(id)))
        );
        this.generatedImages = imageResults.flat().filter(Boolean);
      }
    } catch (error) {
      console.error('Error loading workspace details:', error);
      this.error = error instanceof Error ? error.message : JSON.stringify(error);
      this.showError(this.error);
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/workspace']);
  }

  getStatusClasses(status: string): string {
    return {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800'
    }[status] || 'bg-gray-100 text-gray-800';
  }

  getPlatformClasses(platform: string): string {
    const baseClasses = 'bg-opacity-10';
    return {
      instagram: `${baseClasses} bg-pink-500 text-pink-800`,
      facebook: `${baseClasses} bg-blue-500 text-blue-800`,
      pinterest: `${baseClasses} bg-red-500 text-red-800`
    }[platform.toLowerCase()] || `${baseClasses} bg-gray-500 text-gray-800`;
  }

  getScheduleStatusClasses(status: string): string {
    return {
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }[status] || 'bg-gray-100 text-gray-800';
  }

  getPlatforms(): string[] {
    return Array.from(new Set((this.schedules || []).map(s => s.platform)));
  }

  getSchedulesForPlatform(platform: string): WorkspaceSchedule[] {
    return (this.schedules || []).filter(s => s.platform === platform);
  }

  getContentDescription(contentId: string): string {
    const socialContent = this.socialContent.find(c => c.id === contentId);
    const image = this.generatedImages.find(i => i.id === contentId);
    
    return socialContent?.content ? socialContent.content.substring(0, 50) + '...' : 
           image?.prompt ? `Image: ${image.prompt.substring(0, 50)}...` : 
           'Content not found';
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
