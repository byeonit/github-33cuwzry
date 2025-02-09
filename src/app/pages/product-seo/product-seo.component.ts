import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductSelectorComponent } from '../../components/product-seo/product-selector/product-selector.component';
import { DescriptionGeneratorComponent } from '../../components/product-seo/description-generator/description-generator.component';
import { SocialContentGeneratorComponent } from '../../components/product-seo/social-content-generator/social-content-generator.component';
import { ImageGeneratorComponent } from '../../components/product-seo/image-generator/image-generator.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { ProductService } from '../../services/product.service';
import { Product, ProductDescription } from '../../types';

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
})
export class ProductSeoComponent implements OnInit {
  products: Product[] = [];
  productDescriptions: ProductDescription[] = [];
  selectedProduct: Product | null = null;
  error: string | null = null;
  isLoading = false;
  product = {
    name: '',
    details: '',
    tone: 'professional',
  };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.error = null;

    this.productService.getProducts().pipe(
      catchError((error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe((products) => {
      this.products = products;
    });
  }

  loadProductDescriptions() {
    if (!this.selectedProduct) return;

    this.isLoading = true;
    this.error = null;

    this.productService.getProductDescriptions().pipe(
      catchError((error) => {
        console.error('Error loading product descriptions:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load product descriptions',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe((descriptions) => {
      this.productDescriptions = descriptions;
    });
  }

  onProductSelect(product: Product) {
    this.selectedProduct = product;
    this.loadProductDescriptions();
  }

  onDescriptionGenerated() {
    this.loadProductDescriptions();
  }

  selectProduct(product: Product) {
    this.selectedProduct = product;
    this.product = {
      name: product.name,
      details: product.description ?? '',
      tone: 'professional',
    };
    this.loadProductDescriptions();
  }
}