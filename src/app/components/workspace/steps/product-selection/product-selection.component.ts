import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../types';

@Component({
  selector: 'app-product-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        *ngFor="let product of products"
        class="relative bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
        [class.border-primary]="isSelected(product.id)"
        (click)="toggleProduct(product.id)"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ product.name }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ product.description }}</p>
            <p class="mt-2 text-lg font-medium text-primary">
              {{ product.price | currency }}
            </p>
          </div>
          <div class="flex h-5 items-center">
            <input
              type="checkbox"
              [checked]="isSelected(product.id)"
              (click)="$event.stopPropagation()"
              (change)="toggleProduct(product.id)"
              class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="products.length === 0"
        class="col-span-full flex items-center justify-center p-8 text-center"
      >
        <div>
          <p class="text-gray-500 mb-2">No products available</p>
          <p class="text-sm text-gray-400">
            Add products in the Product Management section first
          </p>
        </div>
      </div>
    </div>
  `
})
export class ProductSelectionComponent {
  @Input() products: Product[] = [];
  @Input() selectedProductIds: string[] = [];
  @Output() selectedProductsChange = new EventEmitter<string[]>();

  isSelected(productId: string): boolean {
    return this.selectedProductIds.includes(productId);
  }

  toggleProduct(productId: string) {
    const updatedSelection = this.isSelected(productId)
      ? this.selectedProductIds.filter(id => id !== productId)
      : [...this.selectedProductIds, productId];
    
    this.selectedProductsChange.emit(updatedSelection);
  }
}