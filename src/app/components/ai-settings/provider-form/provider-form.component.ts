import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIProviderConfig } from '../../../types/ai-provider.types';
import { AIProvider, AIProviderForm } from '../../../types';

@Component({
  selector: 'app-provider-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="submit()" class="space-y-4">
      <div *ngFor="let field of config.fields">
        <ng-container *ngIf="shouldShowField(field)">
          <label [for]="field.name" class="block text-sm font-medium text-gray-700">
            {{ field.label }}
            <span *ngIf="field.required" class="text-red-500">*</span>
          </label>
          <div class="mt-1">
            <ng-container [ngSwitch]="field.type">
              <!-- Select Input -->
              <select
                *ngSwitchCase="'select'"
                [id]="field.name"
                [name]="field.name"
                [(ngModel)]="formData[field.name]"
                [required]="field.required"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option *ngFor="let option of field.options" [value]="option.value">
                  {{ option.label }}
                </option>
              </select>

              <!-- Text/Password/URL/Number Input -->
              <input
                *ngSwitchDefault
                [type]="field.type"
                [id]="field.name"
                [name]="field.name"
                [(ngModel)]="formData[field.name]"
                [required]="field.required"
                [placeholder]="field.placeholder || ''"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </ng-container>
            
            <p *ngIf="field.description" class="mt-1 text-sm text-gray-500">
              {{ field.description }}
            </p>
            <p *ngIf="field.validation?.message && showValidationError(field)" class="mt-1 text-sm text-red-600">
              {{ field.validation?.message }}
            </p>
          </div>
        </ng-container>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          type="button"
          (click)="onCancel.emit()"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="isSubmitting"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Provider' }}
        </button>
      </div>
    </form>
  `
})
export class ProviderFormComponent implements OnInit {
  @Input() config!: AIProviderConfig;
  @Input() isSubmitting = false;
  @Input() initialData?: AIProvider | null = null;
  @Output() onSubmit = new EventEmitter<AIProviderForm>();
  @Output() onCancel = new EventEmitter<void>();

  formData: Record<string, any> = {};
  validationErrors: Record<string, boolean> = {};

  ngOnInit() {
    // Initialize form with default values or initial data
    this.config.fields.forEach(field => {
      if (this.initialData && field.name in this.initialData) {
        this.formData[field.name] = this.initialData[field.name as keyof AIProvider];
      } else if (field.defaultValue) {
        this.formData[field.name] = field.defaultValue;
      }
    });

    // If editing an existing provider, populate settings
    if (this.initialData?.settings) {
      Object.entries(this.initialData.settings).forEach(([key, value]) => {
        if (this.config.fields.some(field => field.name === key)) {
          this.formData[key] = value;
        }
      });
    }
  }

  shouldShowField(field: any): boolean {
    if (!field.showIf) return true;
    return this.formData[field.showIf.field] === field.showIf.value;
  }

  showValidationError(field: any): boolean {
    return this.validationErrors[field.name] || false;
  }

  validateField(field: any): boolean {
    if (!field.validation?.pattern) return true;
    
    const value = this.formData[field.name];
    if (!value) return true; // Skip validation if field is empty and not required
    
    const pattern = new RegExp(field.validation.pattern);
    return pattern.test(value);
  }

  validateForm(): boolean {
    let isValid = true;
    this.validationErrors = {};

    this.config.fields.forEach(field => {
      // Only validate fields that are currently visible
      if (!this.shouldShowField(field)) return;

      if (field.required && !this.formData[field.name]) {
        this.validationErrors[field.name] = true;
        isValid = false;
      } else if (!this.validateField(field)) {
        this.validationErrors[field.name] = true;
        isValid = false;
      }
    });

    return isValid;
  }

  submit() {
    if (!this.validateForm()) return;

    const provider: AIProviderForm = {
      provider: this.config.value as AIProviderForm['provider'],
      settings: { ...this.formData },
    };

    // Move non-standard fields to settings
    const standardFields = ['provider', 'api_key', 'webhook_url', 'base_url', 'is_active'];
    Object.keys(this.formData).forEach(key => {
      if (!standardFields.includes(key)) {
        provider.settings[key] = this.formData[key];
      } else {
        (provider as any)[key] = this.formData[key];
      }
    });

    this.onSubmit.emit(provider);
  }
}