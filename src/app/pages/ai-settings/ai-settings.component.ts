import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AIService } from '../../services/ai.service';
import { AIProviderRegistry } from '../../services/ai-provider.registry';
import { ProviderFormComponent } from '../../components/ai-settings/provider-form/provider-form.component';
import { AIProviderConfig } from '../../types/ai-provider.types';
import { catchError, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AIProvider, AIProviderForm } from '../../types';

@Component({
  selector: 'app-ai-settings',
  standalone: true,
  imports: [CommonModule, ProviderFormComponent],
  templateUrl: './ai-settings.component.html'
})
export class AISettingsComponent implements OnInit {
  providers: AIProvider[] = [];
  availableProviders: AIProviderConfig[] = [];
  selectedConfig: AIProviderConfig | null = null;
  editingProvider: AIProvider | null = null;
  isSubmitting = false;
  testingProviders = new Set<string>(); // Track which providers are being tested

  constructor(
    private aiService: AIService,
    private providerRegistry: AIProviderRegistry
  ) {
    this.availableProviders = this.providerRegistry.getProviders();
  }

  ngOnInit() {
    this.loadProviders();
  }

  loadProviders() {
    this.isSubmitting = true;
    this.aiService.getAIProviders().pipe(
      catchError(error => {
        console.error('Error loading AI providers:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load AI providers',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
        return [];
      }),
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe(providers => {
      this.providers = providers;
    });
  }

  selectProvider(config: AIProviderConfig) {
    this.selectedConfig = config;
  }

  cancelProviderSelection() {
    this.selectedConfig = null;
    this.editingProvider = null;
  }

  saveProvider(formData: AIProviderForm) {
    if (!this.selectedConfig) return;

    if (!this.providerRegistry.validateProviderConfig(formData.provider, formData)) {
      Swal.fire({
        title: 'Invalid Configuration',
        text: 'Please check your provider configuration',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const configToSave = this.providerRegistry.formatProviderConfig(formData.provider, formData);

    this.isSubmitting = true;

    const action = this.editingProvider
      ? this.aiService.updateAIProvider(this.editingProvider.id, configToSave)
      : this.aiService.addAIProvider(configToSave);

    action.pipe(
      catchError(error => {
        console.error('Error saving AI provider:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to save AI provider',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
        return [];
      }),
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe(() => {
      this.loadProviders();
      this.cancelProviderSelection();
      Swal.fire({
        title: 'Success',
        text: `AI provider ${this.editingProvider ? 'updated' : 'added'} successfully`,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb'
      });
    });
  }

  startEdit(provider: AIProvider) {
    this.editingProvider = provider;
    const config = this.providerRegistry.getProvider(provider.provider)?.getConfig();
    if (config) {
      this.selectedConfig = config;
    }
  }

  toggleProvider(provider: AIProvider) {
    this.aiService.updateAIProvider(provider.id, { is_active: !provider.is_active }).pipe(
      catchError(error => {
        console.error('Error updating AI provider:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to update AI provider',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
        return [];
      })
    ).subscribe(() => {
      this.loadProviders();
    });
  }

  deleteProvider(provider: AIProvider) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the ${provider.provider} provider?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        this.aiService.deleteAIProvider(provider.id).pipe(
          catchError(error => {
            console.error('Error deleting AI provider:', error);
            Swal.fire({
              title: 'Error',
              text: 'Failed to delete AI provider',
              icon: 'error',
              confirmButtonText: 'OK',
              confirmButtonColor: '#2563eb'
            });
            return [];
          })
        ).subscribe(() => {
          this.loadProviders();
          Swal.fire({
            title: 'Deleted',
            text: 'AI provider deleted successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb'
          });
        });
      }
    });
  }

  isTestingProvider(providerId: string): boolean {
    return this.testingProviders.has(providerId);
  }

  testConnection(provider: AIProvider) {
    this.testingProviders.add(provider.id);

    this.aiService.testConnection(provider).pipe(
      finalize(() => {
        this.testingProviders.delete(provider.id);
      })
    ).subscribe({
      next: (result) => {
        Swal.fire({
          title: result.success ? 'Success' : 'Error',
          text: result.message,
          icon: result.success ? 'success' : 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      },
      error: (error) => {
        console.error('Error testing connection:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to test connection',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }
}