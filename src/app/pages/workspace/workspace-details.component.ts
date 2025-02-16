import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { WorkspaceService } from "../../services/workspace.service";
import { ProductService } from "../../services/product.service";
import { CampaignSettingsService } from "../../services/campaign-settings.service";
import { Product, SocialPromoContent, GeneratedImage } from "../../types";
import Swal from "sweetalert2";
import {
  Workspace,
  WorkspaceProduct,
  WorkspaceContent,
  WorkspaceSchedule,
} from "../../types/interfaces/workspace.interface";
import { firstValueFrom } from "rxjs";
import { CampaignProvider } from "../../types/interfaces/campaign-provider.interface";

@Component({
  selector: "app-workspace-details",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./workspace-details.component.html",
})
export class WorkspaceDetailsComponent implements OnInit {
  workspace: Workspace | null = null;
  products: Product[] = [];
  socialContent: SocialPromoContent[] = [];
  generatedImages: GeneratedImage[] = [];
  schedules: WorkspaceSchedule[] = [];
  isLoading = true;
  error: string | null = null;
  isLaunching = false;
  selectedProvider: CampaignProvider | null = null;
  providers: CampaignProvider[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workspaceService: WorkspaceService,
    private productService: ProductService,
    private campaignSettingsService: CampaignSettingsService
  ) {}

  async ngOnInit() {
    const workspaceId = this.route.snapshot.paramMap.get("id");
    if (!workspaceId) {
      this.showError("Workspace ID is required");
      return;
    }
    await this.loadWorkspaceDetails(workspaceId);
    await this.loadProviders();
  }

  private async loadProviders() {
    try {
      this.providers = await firstValueFrom(this.campaignSettingsService.getCampaignProviders());
    } catch (error) {
      console.error('Error loading providers:', error);
      this.showError('Failed to load campaign providers');
    }
  }

  async showProviderSelector() {
    if (this.providers.length === 0) {
      const result = await Swal.fire({
        title: 'No Active Providers',
        text: 'Please configure and activate campaign providers in the Campaign Settings page.',
        icon: 'warning',
        confirmButtonText: 'Go to Settings',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#2563eb',
      });

      if (result.isConfirmed) {
        this.router.navigate(['/campaign-settings']);
      }
      return;
    }

    const providerOptions = this.providers
      .filter(p => p.is_active)
      .map(p => ({
        value: p.id,
        text: p.provider.toUpperCase()
      }));

    if (providerOptions.length === 0) {
      await Swal.fire({
        title: 'No Active Providers',
        text: 'Please activate at least one campaign provider in the Campaign Settings page.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const { value: providerId } = await Swal.fire({
      title: 'Select Campaign Provider',
      input: 'select',
      inputOptions: Object.fromEntries(providerOptions.map(p => [p.value, p.text])),
      inputValue: this.selectedProvider?.id,
      showCancelButton: true,
      confirmButtonText: 'Select',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a campaign provider';
        }
        return null;
      }
    });

    if (providerId) {
      this.selectedProvider = this.providers.find(p => p.id === providerId) || null;
    }
  }

  private async loadWorkspaceDetails(workspaceId: string) {
    this.isLoading = true;
    this.error = null;

    try {
      this.workspace = await this.fetchWorkspace(workspaceId);
      if (!this.workspace) throw new Error("Workspace not found");
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
    const [products, content = [], schedules] = await Promise.all([
      firstValueFrom(this.workspaceService.getWorkspaceProducts(workspaceId)),
      firstValueFrom(this.workspaceService.getWorkspaceContent(workspaceId)),
      firstValueFrom(this.workspaceService.getWorkspaceSchedules(workspaceId)),
    ]);

    this.schedules = schedules || [];
    await this.loadProducts(products);
    await this.loadContent(content);
  }

  private async loadProducts(products: WorkspaceProduct[]) {
    if (products.length > 0) {
      const productIds = products.map((p) => p.product_id);
      this.products =
        (await firstValueFrom(
          this.productService.getProductsByIds(productIds)
        )) || [];
    }
  }

  private async loadContent(content: WorkspaceContent[]) {
    const socialContentIds = content
      .filter((c) => c.content_type === "social")
      .map((c) => c.content_id);

    const imageContentIds = content
      .filter((c) => c.content_type === "image")
      .map((c) => c.content_id);

    await Promise.all([
      this.loadSocialContent(socialContentIds),
      this.loadGeneratedImages(imageContentIds),
    ]);
  }

  private async loadSocialContent(socialContentIds: string[]) {
    if (socialContentIds.length > 0) {
      const socialContentResults = await Promise.all(
        socialContentIds.map((id) =>
          firstValueFrom(this.workspaceService.getWorkspaceSelectedSocialContent(id))
        )
      );
      this.socialContent = socialContentResults.flat().filter(Boolean);
    }
  }

  private async loadGeneratedImages(imageContentIds: string[]) {
    if (imageContentIds.length > 0) {
      const imageResults = await Promise.all(
        imageContentIds.map((id) =>
          firstValueFrom(this.workspaceService.getWorkspaceSelectedGeneratedImages(id))
        )
      );
      this.generatedImages = imageResults.flat().filter(Boolean);
    }
  }

  async launchCampaign() {
    if (!this.workspace || this.isLaunching) return;

    if (!this.selectedProvider) {
      await Swal.fire({
        title: 'No Provider Selected',
        text: 'Please select a campaign provider before launching the campaign',
        icon: 'warning',
        confirmButtonText: 'Select Provider',
        showCancelButton: true,
        confirmButtonColor: '#2563eb'
      }).then((result) => {
        if (result.isConfirmed) {
          this.showProviderSelector();
        }
      });
      return;
    }

    const confirmed = await Swal.fire({
      title: 'Launch Campaign?',
      text: 'This will send the campaign to the selected provider and schedule all content for publication. Continue?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, launch it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
    });

    if (confirmed.isConfirmed) {
      this.isLaunching = true;

      try {
        await firstValueFrom(this.workspaceService.sendToProvider(this.workspace.id));
        
        const updatedWorkspace = await firstValueFrom(
          this.workspaceService.updateWorkspaceStatus(this.workspace.id, 'scheduled')
        );
        
        this.workspace = updatedWorkspace;
        
        await Swal.fire({
          title: 'Success!',
          text: 'Campaign has been sent to provider and scheduled for publication',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      } catch (error) {
        console.error('Error launching campaign:', error);
        await Swal.fire({
          title: 'Error',
          text: error instanceof Error ? error.message : 'Failed to launch campaign',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      } finally {
        this.isLaunching = false;
      }
    }
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getPlatformClasses(platform: string): string {
    const baseClasses = "bg-opacity-10";
    switch (platform.toLowerCase()) {
      case "instagram":
        return `${baseClasses} bg-pink-500 text-pink-800`;
      case "facebook":
        return `${baseClasses} bg-blue-500 text-blue-800`;
      case "pinterest":
        return `${baseClasses} bg-red-500 text-red-800`;
      default:
        return `${baseClasses} bg-gray-500 text-gray-800`;
    }
  }

  getScheduleStatusClasses(status: string): string {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "published":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getPlatforms(): string[] {
    return Array.from(new Set(this.schedules.map((s) => s.platform)));
  }

  getSchedulesForPlatform(platform: string): WorkspaceSchedule[] {
    return this.schedules.filter((s) => s.platform === platform);
  }

  getContentDescription(contentId: string): string {
    const socialContent = this.socialContent.find((c) => c.id === contentId);
    if (socialContent) {
      return socialContent.content.substring(0, 50) + "...";
    }

    const image = this.generatedImages.find((i) => i.id === contentId);
    if (image) {
      return `Image: ${image.prompt.substring(0, 50)}...`;
    }

    return "Content not found";
  }

  private showSuccess(message: string) {
    Swal.fire({
      title: "Success!",
      text: message,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#2563eb",
    });
  }

  private handleError(error: any) {
    console.error("Error loading workspace details:", error);
    this.error = error instanceof Error ? error.message : JSON.stringify(error);
    this.showError(this.error);
  }

  goBack() {
    this.router.navigate(["/workspace"]);
  }

  private showError(message: string) {
    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#2563eb",
    });
  }
}