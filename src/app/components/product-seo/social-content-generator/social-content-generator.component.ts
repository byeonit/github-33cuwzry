import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialContentService } from './social-content.service';
import { SocialContentUIService } from './social-content-ui.service';
import { AuthService } from '../../../services/auth.service';
import { SocialContentState } from './social-content-generator.types';
import { AIProvider, Product, SocialPromoContent, SocialPromoOptions } from '../../../types';

@Component({
  selector: 'app-social-content-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './social-content-generator.component.html',
  providers: [SocialContentService, SocialContentUIService]
})
export class SocialContentGeneratorComponent implements OnInit {
  @Input() selectedProduct: Product | null = null;

  state: SocialContentState = {
    providers: [],
    selectedProvider: null,
    platforms: ['instagram', 'pinterest', 'facebook'],
    activePlatform: 'instagram',
    socialOptions: {
      platform: 'instagram',
      contentType: 'product_showcase',
      tone: 'professional',
      includePrice: false,
      includeCTA: true,
      targetAudience: 'general',
      promotionalAngle: 'features'
    },
    isGenerating: false,
    isSaving: false,
    generatedContent: [],
    savedContent: []
  };

  // Expose state properties to template
  get selectedProvider(): AIProvider | null {
    return this.state.selectedProvider;
  }

  get platforms(): ('instagram' | 'pinterest' | 'facebook')[] {
    return this.state.platforms;
  }

  get activePlatform(): 'instagram' | 'pinterest' | 'facebook' {
    return this.state.activePlatform;
  }

  get socialOptions(): SocialPromoOptions {
    return this.state.socialOptions;
  }

  get isGenerating(): boolean {
    return this.state.isGenerating;
  }

  get generatedContent(): SocialPromoContent[] {
    return this.state.generatedContent;
  }

  get savedContent(): SocialPromoContent[] {
    return this.state.savedContent;
  }

  constructor(
    private socialContentService: SocialContentService,
    private uiService: SocialContentUIService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.selectedProduct) {
      this.loadSavedContent();
      this.loadAIProviders();
    }
  }

  private loadAIProviders() {
    this.socialContentService.getAIProviders().subscribe({
      next: (providers) => {
        this.state.providers = providers.filter(p => p.is_active);
        if (this.state.providers.length > 0) {
          this.state.selectedProvider = this.state.providers[0];
        }
      },
      error: (error) => {
        console.error('Error loading AI providers:', error);
        this.uiService.showError('Error', 'Failed to load AI providers');
      }
    });
  }

  async generateContent() {
    if (!this.selectedProduct || !this.state.selectedProvider) return;

    this.state.isGenerating = true;
    await this.uiService.showToast({ icon: 'info', title: 'Generating content...' });

    // Get current user
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user) {
          this.uiService.showError('Error', 'You must be logged in to generate content');
          this.state.isGenerating = false;
          return;
        }

        try {
          this.socialContentService.generateContent(
            this.state.selectedProvider!,
            this.selectedProduct!,
            this.state.socialOptions
          ).subscribe({
            next: (generatedContent) => {
              const content: SocialPromoContent = {
                id: crypto.randomUUID(),
                product_id: this.selectedProduct!.id,
                user_id: user.id, // Include user_id
                platform: this.state.activePlatform,
                content: generatedContent.content,
                hashtags: generatedContent.hashtags,
                created_at: new Date().toISOString(),
                options: { ...this.state.socialOptions }
              };

              this.state.generatedContent.push(content);
              this.state.isGenerating = false;
              this.uiService.showToast({ icon: 'success', title: 'Content generated successfully!' });
            },
            error: (error) => {
              console.error('Error generating content:', error);
              this.state.isGenerating = false;
              this.uiService.showError('Generation Failed', error.message || 'Failed to generate content');
            }
          });
        } catch (error) {
          console.error('Error in generation process:', error);
          this.state.isGenerating = false;
          this.uiService.showError('Generation Failed', 'An unexpected error occurred');
        }
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.state.isGenerating = false;
        this.uiService.showError('Error', 'Failed to get current user');
      }
    });
  }

  async showProviderSelector() {
    const providerId = await this.uiService.showProviderSelector(
      this.state.providers,
      this.state.selectedProvider?.id
    );

    if (providerId) {
      this.state.selectedProvider = this.state.providers.find(p => p.id === providerId) || null;
    }
  }

  setActivePlatform(platform: 'instagram' | 'pinterest' | 'facebook') {
    this.state.activePlatform = platform;
    this.state.socialOptions.platform = platform;
  }

  getContentByPlatform(platform: string): SocialPromoContent[] {
    return this.state.generatedContent.filter(content => content.platform === platform);
  }

  getSavedContentByPlatform(platform: string): SocialPromoContent[] {
    return this.state.savedContent.filter(content => content.platform === platform);
  }

  removeGeneratedContent(contentId: string) {
    this.state.generatedContent = this.state.generatedContent.filter(c => c.id !== contentId);
  }

  async saveContent(content: SocialPromoContent) {
    if (!this.selectedProduct) return;

    this.state.isSaving = true;
    await this.uiService.showToast({ icon: 'info', title: 'Saving content...' });

    try {
      this.socialContentService.saveContent(content).subscribe({
        next: (savedContent) => {
          this.state.generatedContent = this.state.generatedContent.filter(c => c.id !== content.id);
          this.state.savedContent = [savedContent, ...this.state.savedContent];
          this.uiService.showToast({ icon: 'success', title: 'Content saved successfully!' });
        },
        error: (error) => {
          console.error('Error saving content:', error);
          this.uiService.showError('Save Failed', 'Failed to save content');
        },
        complete: () => {
          this.state.isSaving = false;
        }
      });
    } catch (error) {
      console.error('Error in save operation:', error);
      this.state.isSaving = false;
      this.uiService.showError('Save Failed', 'An unexpected error occurred');
    }
  }

  async deleteContent(contentId: string) {
    const confirmed = await this.uiService.showDeleteConfirmation();
    if (!confirmed) return;

    this.socialContentService.deleteContent(contentId).subscribe({
      next: () => {
        this.state.savedContent = this.state.savedContent.filter(c => c.id !== contentId);
        this.uiService.showToast({ icon: 'success', title: 'Content deleted successfully!' });
      },
      error: (error) => {
        console.error('Error deleting content:', error);
        this.uiService.showError('Error', 'Failed to delete content');
      }
    });
  }

  private loadSavedContent() {
    if (!this.selectedProduct) return;

    this.socialContentService.getSavedContent(this.selectedProduct.id).subscribe({
      next: (content) => {
        this.state.savedContent = content;
      },
      error: (error) => {
        console.error('Error loading saved content:', error);
        this.uiService.showError('Error', 'Failed to load saved content');
      }
    });
  }
}