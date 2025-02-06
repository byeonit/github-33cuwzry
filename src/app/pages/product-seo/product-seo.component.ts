import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Product, ProductDescription } from '../../types/supabase.types';
import { ProductSelectorComponent } from '../../components/product-seo/product-selector/product-selector.component';
import { DescriptionGeneratorComponent } from '../../components/product-seo/description-generator/description-generator.component';
import { SocialContentGeneratorComponent } from '../../components/product-seo/social-content-generator/social-content-generator.component';
import { ImageGeneratorComponent } from '../../components/product-seo/image-generator/image-generator.component';

@Component({
  selector: 'app-product-seo',
  standalone: true,
  imports: [
    CommonModule,
    ProductSelectorComponent,
    DescriptionGeneratorComponent,
    SocialContentGeneratorComponent,
    ImageGeneratorComponent,
  ],
  templateUrl: './product-seo.component.html',
  /*template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Product SEO & Marketing</h1>

        <!-- Product Selector -->
        <app-product-selector
          [products]="products"
          (productSelected)="onProductSelect($event)"
        />

        <div *ngIf="selectedProduct">
          <!-- Description Generator -->
          <app-description-generator
            [selectedProduct]="selectedProduct"
            [descriptions]="productDescriptions"
            (descriptionGenerated)="onDescriptionGenerated()"
          />

          <!-- Social Content Generator -->
          <app-social-content-generator
            [selectedProduct]="selectedProduct"
          />

          <!-- Image Generator -->
          <app-image-generator
            [selectedProduct]="selectedProduct"
          />
        </div>
      </div>
    </div>
  `,*/
})
export class ProductSeoComponent implements OnInit {
  products: Product[] = [];
  productDescriptions: ProductDescription[] = [];
  selectedProduct: Product | null = null;
  error: string | null = null;
  product = {
    name: '',
    details: '',
    tone: 'professional',
  };

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadProducts();
    this.loadProductDescriptions();
  }

  loadProducts() {
    this.supabaseService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
      },
    });
  }

  loadProductDescriptions() {
    this.supabaseService.getProductDescriptions().subscribe({
      next: (descriptions) => {
        this.productDescriptions = descriptions;
      },
      error: (error) => {
        console.error('Error loading product descriptions:', error);
        this.error = 'Failed to load product descriptions';
      },
    });
  }

  onProductSelect(product: Product) {
    this.selectedProduct = product;
  }

  onDescriptionGenerated() {
    this.loadProductDescriptions();
  }

  selectProduct(product: Product) {
    this.selectedProduct = product;
    this.product = {
      name: product.name,
      details: product.description,
      tone: 'professional',
    };
  }
}
