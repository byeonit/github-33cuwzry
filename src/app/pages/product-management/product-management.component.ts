import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import Swal from 'sweetalert2';
import { Product } from '../../types';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow rounded-lg">
          <!-- Header -->
          <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Product Management</h2>
                <p class="mt-1 text-sm text-gray-500">
                  Add and manage your products for SEO optimization
                </p>
              </div>
              <button
                (click)="showAddProductForm()"
                class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Add New Product
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>

          <!-- Product List -->
          <div *ngIf="!isLoading" class="px-4 py-5 sm:p-6">
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div
                *ngFor="let product of products"
                class="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">{{ product.name }}</h3>
                    <p class="mt-1 text-sm text-gray-600">{{ product.description }}</p>
                    <p class="mt-2 text-sm font-medium text-primary">{{ product.price | currency }}</p>
                    <p class="mt-1 text-xs text-gray-500">Added: {{ product.created_at | date:'medium' }}</p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      (click)="editProduct(product)"
                      class="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      (click)="deleteProduct(product)"
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="products.length === 0" class="col-span-full text-center py-12">
                <p class="text-gray-500">No products found. Click "Add New Product" to get started.</p>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="p-4 bg-red-50 border-t border-red-200">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to load products',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  async showAddProductForm() {
    const { value: formValues } = await Swal.fire({
      title: 'Add New Product',
      html: `
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Product Name</label>
            <input id="name" class="swal2-input" placeholder="Enter product name">
          </div>
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" class="swal2-textarea" placeholder="Enter product description"></textarea>
          </div>
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
            <input id="price" type="number" step="0.01" class="swal2-input" placeholder="Enter price">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add Product',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const price = parseFloat((document.getElementById('price') as HTMLInputElement).value);

        if (!name || !description || isNaN(price)) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }

        if (price < 0) {
          Swal.showValidationMessage('Price cannot be negative');
          return false;
        }

        return { name, description, price };
      }
    });

    if (formValues) {
      this.addProduct(formValues);
    }
  }

  async editProduct(product: Product) {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Product',
      html: `
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Product Name</label>
            <input id="name" class="swal2-input" value="${product.name}" placeholder="Enter product name">
          </div>
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" class="swal2-textarea" placeholder="Enter product description">${product.description}</textarea>
          </div>
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
            <input id="price" type="number" step="0.01" class="swal2-input" value="${product.price}" placeholder="Enter price">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Product',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const price = parseFloat((document.getElementById('price') as HTMLInputElement).value);

        if (!name || !description || isNaN(price)) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }

        if (price < 0) {
          Swal.showValidationMessage('Price cannot be negative');
          return false;
        }

        return { name, description, price };
      }
    });

    if (formValues) {
      this.updateProduct(product.id, formValues);
    }
  }

  addProduct(productData: { name: string; description: string; price: number }) {
    this.productService.addProduct(productData).subscribe({
      next: () => {
        this.loadProducts();
        Swal.fire({
          title: 'Success',
          text: 'Product added successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      },
      error: (error) => {
        console.error('Error adding product:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to add product',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  updateProduct(id: string, productData: { name: string; description: string; price: number }) {
    this.productService.updateProduct(id, productData).subscribe({
      next: () => {
        this.loadProducts();
        Swal.fire({
          title: 'Success',
          text: 'Product updated successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      },
      error: (error) => {
        console.error('Error updating product:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to update product',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  deleteProduct(product: Product) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.loadProducts();
            Swal.fire({
              title: 'Deleted!',
              text: 'Product has been deleted',
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#2563eb'
            });
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            Swal.fire({
              title: 'Error',
              text: 'Failed to delete product',
              icon: 'error',
              confirmButtonText: 'OK',
              confirmButtonColor: '#2563eb'
            });
          }
        });
      }
    });
  }
}