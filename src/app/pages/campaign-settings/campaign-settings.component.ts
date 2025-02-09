import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignSettingsService } from '../../services/campaign-settings.service';
import { CampaignProviderRegistry } from '../../services/campaign-provider.registry';
//import { ProviderFormComponent } from '../../components/ai-settings/provider-form/provider-form.component';
import { CampaignProviderConfig } from '../../types/interfaces/campaign-provider.interface';
import { catchError, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CampaignProvider, CampaignProviderForm } from '../../types/interfaces/campaign-provider.interface';
import { CampaignProviderFormComponent } from '../../components/ai-settings/provider-form/campaign-provider-form.component';

@Component({
  selector: 'app-campaign-settings',
  standalone: true,
  imports: [CommonModule, CampaignProviderFormComponent],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow rounded-lg">
          <!-- Header -->
          <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 class="text-2xl font-bold text-gray-900">Campaign Provider Settings</h2>
            <p class="mt-1 text-sm text-gray-500">
              Configure your campaign providers for launching digital workspace campaigns
            </p>
          </div>

          <!-- Provider Selection -->
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ editingProvider ? 'Edit Provider' : 'Add New Provider' }}
            </h3>

            <div *ngIf="!selectedConfig" class="space-y-4">
              <label class="block text-sm font-medium text-gray-700">Select Provider</label>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  *ngFor="let config of availableProviders"
                  (click)="selectProvider(config)"
                  class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-primary focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                >
                  <div class="flex-1 min-w-0">
                    <span class="absolute inset-0" aria-hidden="true"></span>
                    <p class="text-sm font-medium text-gray-900">{{ config.label }}</p>
                    <p class="text-sm text-gray-500 truncate">{{ config.description }}</p>
                  </div>
                </button>
              </div>
            </div>

            <app-campaign-provider-form
              *ngIf="selectedConfig"
              [config]="selectedConfig"
              [isSubmitting]="isSubmitting"
              [initialData]="editingProvider"
              (onSubmit)="saveProvider($event)"
              (onCancel)="cancelProviderSelection()"
            />
          </div>

          <!-- Configured Providers -->
          <div class="px-4 py-5 sm:p-6 border-t border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Configured Providers</h3>
            
            <div class="space-y-4">
              <div
                *ngFor="let provider of providers"
                class="bg-gray-50 p-4 rounded-lg"
                [class.border-2]="editingProvider?.id === provider.id"
                [class.border-primary]="editingProvider?.id === provider.id"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="text-lg font-medium text-gray-900">
                      {{ provider.provider | titlecase }}
                    </h4>
                    <p class="text-sm text-gray-500 mt-1">
                      Added: {{ provider.created_at | date:'medium' }}
                    </p>
                    <p *ngIf="provider.webhook_url" class="text-sm text-gray-500">
                      Webhook URL: {{ provider.webhook_url }}
                    </p>
                  </div>
                  <div class="flex space-x-4">
                    <button
                      (click)="testConnection(provider)"
                      [disabled]="isTestingProvider(provider.id)"
                      class="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      {{ isTestingProvider(provider.id) ? 'Testing...' : 'Test Connection' }}
                    </button>
                    <button
                      (click)="toggleProvider(provider)"
                      [class]="provider.is_active ? 'text-green-600' : 'text-gray-400'"
                      class="text-sm font-medium hover:text-green-800"
                    >
                      {{ provider.is_active ? 'Active' : 'Inactive' }}
                    </button>
                    <button
                      (click)="startEdit(provider)"
                      class="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      (click)="deleteProvider(provider)"
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="providers.length === 0" class="text-center py-4">
                <p class="text-gray-500">No campaign providers configured yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CampaignSettingsComponent implements OnInit {
  providers: CampaignProvider[] = [];
  availableProviders: CampaignProviderConfig[] = [];
  selectedConfig: CampaignProviderConfig | null = null;
  editingProvider: CampaignProvider | null = null;
  isSubmitting = false;
  testingProviders = new Set<string>();

  constructor(
    private campaignSettingsService: CampaignSettingsService,
    private providerRegistry: CampaignProviderRegistry
  ) {
    this.availableProviders = this.providerRegistry.getProviders();
  }

  ngOnInit() {
    this.loadProviders();
  }

  loadProviders() {
    this.isSubmitting = true;
    this.campaignSettingsService.getCampaignProviders().pipe(
      catchError(error => {
        console.error('Error loading campaign providers:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load campaign providers',
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

  selectProvider(config: CampaignProviderConfig) {
    this.selectedConfig = config;
  }

  cancelProviderSelection() {
    this.selectedConfig = null;
    this.editingProvider = null;
  }

  saveProvider(formData: CampaignProviderForm) {
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
      ? this.campaignSettingsService.updateCampaignProvider(this.editingProvider.id, configToSave)
      : this.campaignSettingsService.addCampaignProvider(configToSave);

    action.pipe(
      catchError(error => {
        console.error('Error saving campaign provider:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to save campaign provider',
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
        text: `Campaign provider ${this.editingProvider ? 'updated' : 'added'} successfully`,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb'
      });
    });
  }

  startEdit(provider: CampaignProvider) {
    this.editingProvider = provider;
    const config = this.providerRegistry.getProvider(provider.provider)?.getConfig();
    if (config) {
      this.selectedConfig = config;
    }
  }

  toggleProvider(provider: CampaignProvider) {
    this.campaignSettingsService.updateCampaignProvider(provider.id, { is_active: !provider.is_active }).pipe(
      catchError(error => {
        console.error('Error updating campaign provider:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to update campaign provider',
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

  deleteProvider(provider: CampaignProvider) {
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
        this.campaignSettingsService.deleteCampaignProvider(provider.id).pipe(
          catchError(error => {
            console.error('Error deleting campaign provider:', error);
            Swal.fire({
              title: 'Error',
              text: 'Failed to delete campaign provider',
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
            text: 'Campaign provider deleted successfully',
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

  async testConnection(provider: CampaignProvider) {
    this.testingProviders.add(provider.id);

    const providerService = this.providerRegistry.getProvider(provider.provider);
    if (!providerService) {
      this.testingProviders.delete(provider.id);
      Swal.fire({
        title: 'Error',
        text: 'Provider service not found',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    try {
      const result = await providerService.testConnection(provider);
      Swal.fire({
        title: result.success ? 'Success' : 'Error',
        text: result.message,
        icon: result.success ? 'success' : 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb'
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to test connection',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb'
      });
    } finally {
      this.testingProviders.delete(provider.id);
    }
  }
}