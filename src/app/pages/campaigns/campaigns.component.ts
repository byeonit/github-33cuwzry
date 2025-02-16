import { Component, OnInit } from '@angular/core';
import {
  CommonModule,
  NgIf,
  NgFor,
  AsyncPipe,
  DatePipe,
} from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { from } from 'rxjs';
import Swal from 'sweetalert2';
import { MarketingService } from '../../services/marketing.service';
import { MarketingCampaign } from '../../types';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor, AsyncPipe, DatePipe],
  template: `
      <div class="min-h-screen bg-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow rounded-lg">
          <!-- Header -->
          <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-gray-900">Marketing Campaigns</h2>
              <a
                routerLink="/add-campaign"
                class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
              >
                Add New Campaign
              </a>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="p-4 bg-red-50 border-b">
            <p class="text-red-600">{{error}}</p>
          </div>

          <!-- Campaigns Table -->
          <div *ngIf="!isLoading" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Audience
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let campaign of campaigns">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      <a [routerLink]="['/campaigns', campaign.id]" class="hover:text-primary">
                        {{campaign.campaign_name}}
                      </a>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{campaign.target_audience}}</div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{campaign.budget.toFixed(2)}}</div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{campaign.start_date | date:'mediumDate'}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{campaign.end_date | date:'mediumDate'}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      [routerLink]="['/campaigns', campaign.id]"
                      class="text-primary hover:text-primary-dark mr-4"
                    >
                      View Details
                    </a>
                    <button
                      (click)="deleteCampaign(campaign)"
                      class="text-red-600 hover:text-red-900"
                      [disabled]="isDeleting"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div *ngIf="campaigns.length === 0" class="text-center py-12">
              <p class="text-gray-500">No campaigns found.</p>
            </div>
          </div>

          <!-- Pagination -->
          <div class="px-4 py-4 border-t border-gray-200 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex-1 flex justify-between sm:hidden">
                <button
                  [disabled]="currentPage === 0"
                  (click)="changePage(currentPage - 1)"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  [disabled]="!hasNextPage"
                  (click)="changePage(currentPage + 1)"
                  class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    Showing
                    <span class="font-medium">{{startIndex + 1}}</span>
                    to
                    <span class="font-medium">{{endIndex}}</span>
                    of
                    <span class="font-medium">{{totalItems}}</span>
                    results
                  </p>
                </div>
                <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      [disabled]="currentPage === 0"
                      (click)="changePage(currentPage - 1)"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="sr-only">Previous</span>
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <button
                      [disabled]="!hasNextPage"
                      (click)="changePage(currentPage + 1)"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="sr-only">Next</span>
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
`,
})
export class CampaignsComponent implements OnInit {
  campaigns: MarketingCampaign[] = [];
  isLoading: boolean = true;
  isDeleting: boolean = false;
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  hasNextPage = false;
  error: string | null = null;

  get startIndex(): number {
    return this.currentPage * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.totalItems);
  }

  constructor(private supabaseService: MarketingService) {}

  ngOnInit() {
    this.loadCampaigns();
  }

  loadCampaigns() {
    this.isLoading = true;
    this.error = null;

    from(
      this.supabaseService.getPaginatedCampaigns(
        this.currentPage,
        this.pageSize
      )
    ).subscribe({
      next: (response) => {
        this.campaigns = response.data;
        this.totalItems = response.count;
        this.hasNextPage =
          (this.currentPage + 1) * this.pageSize < response.count;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading campaigns:', error);
        this.error = error.message || 'Failed to load marketing campaigns';
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: this.error || 'An unknown error occurred',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb',
        });
      },
    });
  }

  async deleteCampaign(campaign: MarketingCampaign) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the campaign "${campaign.campaign_name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      this.isDeleting = true;
      this.supabaseService.deleteCampaign(campaign.id).subscribe({
        next: () => {
          this.loadCampaigns();
          Swal.fire({
            title: 'Deleted!',
            text: 'Campaign has been deleted successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb',
          });
          this.isDeleting = false;
        },
        error: (error) => {
          console.error('Error deleting campaign:', error);
          const errorMessage = error.message || 'Failed to delete the campaign';
          this.error = errorMessage;
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb',
          });
          this.isDeleting = false;
        },
      });
    }
  }

  changePage(newPage: number) {
    if (
      newPage >= 0 &&
      (newPage * this.pageSize < this.totalItems || newPage === 0)
    ) {
      this.currentPage = newPage;
      this.loadCampaigns();
    }
  }
}
