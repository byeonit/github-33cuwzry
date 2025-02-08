import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../types';

@Component({
  selector: 'app-product-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-8 bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h2 class="text-xl font-semibold text-gray-900">Your Products</h2>
        <p class="mt-1 text-sm text-gray-500">
          Click "Generate SEO" on any product to automatically fill the form below.
        </p>
      </div>

      <div class="px-4 py-5 sm:p-6">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Product Cards -->
          <div
            *ngFor="let product of products"
            class="bg-gray-50 p-4 rounded-lg transition-all duration-200 hover:shadow-md"
            [class.border-2]="selectedProductId === product.id"
            [class.border-primary]="selectedProductId === product.id"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-medium text-gray-900">
                {{ product.name }}
              </h3>
              <span class="text-sm font-medium text-primary">
                {{ product.price | currency }}
              </span>
            </div>
            
            <p class="text-sm text-gray-600 mb-4">{{ product.description }}</p>
            
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Created: {{ product.created_at | date:'medium' }}
              </div>
              <button
                (click)="onSelect(product)"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              >
                <svg
                  *ngIf="selectedProductId === product.id"
                  class="mr-1.5 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {{ selectedProductId === product.id ? 'Selected' : 'Generate SEO' }}
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="products.length === 0" class="text-center py-12 col-span-full">
            <p class="text-gray-500">No products found.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductSelectorComponent {
  @Input() products: Product[] = [];
  @Output() productSelected = new EventEmitter<Product>();
  
  selectedProductId: string | null = null;

  onSelect(product: Product) {
    this.selectedProductId = product.id;
    this.productSelected.emit(product);
  }
}