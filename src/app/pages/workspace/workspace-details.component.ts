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

    console.log(`Loading workspace details for ID: ${workspaceId}`);

    try {
      this.workspace = await this.fetchWorkspace(workspaceId);
      if (!this.workspace) throw new Error('Workspace not found');
console.log("Inside loadWorkspaceDetails try ... this.loadWorkspaceData(workspaceId)  : "  );
      await this.loadWorkspaceData(workspaceId);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private async fetchWorkspace(workspaceId: string): Promise<Workspace | null> {
    return firstValueFrom(this.workspaceService.getWorkspaceById(workspaceId));
  }

  private async loadWorkspaceData(workspaceId: string) {
    console.log("/////////////////////////////////////////////////////" );
    console.log("Inside loadWorkspaceData  : "  );
    const [products, content = [], schedules] = await Promise.all([
      firstValueFrom(this.workspaceService.getWorkspaceProducts(workspaceId)),
      firstValueFrom(this.workspaceService.getWorkspaceContent(workspaceId)),
      firstValueFrom(this.workspaceService.getWorkspaceSchedules(workspaceId))
    ]);
    
    console.log("Inside loadWorkspaceData  for products : "  + JSON.stringify(products));
    console.log("Inside loadWorkspaceData  for content : "  + JSON.stringify(content));
    console.log("Inside loadWorkspaceData  for schedules : "  + JSON.stringify(schedules));
    console.log("/////////////////////////////////////////////////////" );

    this.schedules = schedules || [];
    await this.loadProducts(products);
    await this.loadContent(content);
  }

  private async loadProducts(products: WorkspaceProduct[]) {
    if (products.length > 0) {
      const productIds = products.map(p => p.product_id);
      this.products = (await firstValueFrom(this.productService.getProductsByIds(productIds))) || [];
    }
  }

  private async loadContent(content: WorkspaceContent[]) {
    const socialContentIds = content.filter(c => c.content_type === 'social').map(c => c.content_id);
    const imageContentIds = content.filter(c => c.content_type === 'image').map(c => c.content_id);

    console.log('Fetching content with IDs:', { socialContentIds, imageContentIds });

    await Promise.all([
      this.loadSocialContent(socialContentIds),
      this.loadGeneratedImages(imageContentIds)
    ]);
  }

  private async loadSocialContent(socialContentIds: string[]) {

console.log("  "); 
console.log("***************************************");
console.log("Now Loading the selected social content");
console.log("if (socialContentIds.length > 0) => length = " + socialContentIds.length);
console.log("if (socialContentIds.length > 0) => socialContentIds[0] = " + socialContentIds[0]);
console.log("if (socialContentIds.length > 0) => socialContentIds[0] firstValueFrom = " + await firstValueFrom(this.productService.getSocialContent(socialContentIds[0])));
/*
le  this.productService.getSocialContent a besoin du product ID et toi tu envoie le socialContent_ID
*/
    if (socialContentIds.length > 0) {
      const socialContentResults = await Promise.all(
        socialContentIds.map(id => firstValueFrom(this.productService.getSocialContent(id)))
      );
      console.log("inside IF with  socialContentResults = " + JSON.stringify(socialContentResults));
      this.socialContent = socialContentResults.flat().filter(Boolean);
    }
console.log("***************************************");    
  }

  private async loadGeneratedImages(imageContentIds: string[]) {
    if (imageContentIds.length > 0) {
      const imageResults = await Promise.all(
        imageContentIds.map(id => firstValueFrom(this.productService.getGeneratedImages(id)))
      );
      this.generatedImages = imageResults.flat().filter(Boolean);
    }
  }

  async launchCampaign() {
    if (!this.workspace) return;

    const confirmed = await this.confirmLaunch();
    if (confirmed) {
      this.executeCampaignLaunch();
    }
  }

  private async confirmLaunch(): Promise<boolean> {
    const result = await Swal.fire({
      title: 'Launch Campaign?',
      text: 'This will schedule all content for publication. Continue?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, launch it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb'
    });
    return result.isConfirmed;
  }

  private executeCampaignLaunch() {
    if (!this.workspace) return;

    this.workspaceService.updateWorkspaceStatus(this.workspace.id, 'scheduled').subscribe({
      next: (updatedWorkspace) => {
        this.workspace = updatedWorkspace;
        this.showSuccess('Campaign has been scheduled for publication');
      },
      error: (error) => {
        console.error('Error launching campaign:', error);
        this.showError('Failed to launch campaign');
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
  private showSuccess(message: string) {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb'
    });
  }

  private handleError(error: any) {
    console.error('Error loading workspace details:', error);
    this.error = error instanceof Error ? error.message : JSON.stringify(error);
    this.showError(this.error);
  }

  goBack() {
    this.router.navigate(['/workspace']);
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
