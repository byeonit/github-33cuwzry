import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import Swal from 'sweetalert2';
import { Workspace } from '../../types/interfaces/workspace.interface';

@Component({
  selector: 'app-workspace-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Marketing Campaigns</h1>
            <p class="mt-2 text-sm text-gray-500">
              Manage your multi-channel marketing campaigns
            </p>
          </div>
          <a
            routerLink="/workspace/new"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
          >
            Create Campaign
          </a>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <!-- Workspace Grid -->
        <div *ngIf="!isLoading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            *ngFor="let workspace of workspaces"
            class="bg-white shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ workspace.name }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Created {{ workspace.created_at | date:'medium' }}
                  </p>
                </div>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  [ngClass]="getStatusClasses(workspace.status)"
                >
                  {{ workspace.status | titlecase }}
                </span>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  *ngIf="workspace.status === 'draft'"
                  (click)="launchCampaign(workspace)"
                  class="px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md"
                >
                  Launch
                </button>
                <a
                  [routerLink]="['/workspace', workspace.id]"
                  class="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  View Details
                </a>
                <button
                  (click)="deleteWorkspace(workspace)"
                  class="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            *ngIf="workspaces.length === 0"
            class="col-span-full flex items-center justify-center py-12 text-center"
          >
            <div>
              <p class="text-gray-500 mb-2">No campaigns found</p>
              <p class="text-sm text-gray-400">
                Create your first marketing campaign to get started
              </p>
              <a
                routerLink="/workspace/new"
                class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
              >
                Create Campaign
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WorkspaceListComponent implements OnInit {
  workspaces: Workspace[] = [];
  isLoading = true;

  constructor(private workspaceService: WorkspaceService) {}

  ngOnInit() {
    this.loadWorkspaces();
  }

  loadWorkspaces() {
    this.isLoading = true;
    this.workspaceService.getWorkspaces().subscribe({
      next: (workspaces) => {
        this.workspaces = workspaces;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading workspaces:', error);
        this.showError('Failed to load campaigns');
        this.isLoading = false;
      }
    });
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  async launchCampaign(workspace: Workspace) {
    const result = await Swal.fire({
      title: 'Launch Campaign?',
      text: 'This will schedule all content for publication. Continue?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, launch it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb'
    });

    if (result.isConfirmed) {
      this.workspaceService.updateWorkspaceStatus(workspace.id, 'scheduled').subscribe({
        next: () => {
          workspace.status = 'scheduled';
          Swal.fire({
            title: 'Success!',
            text: 'Campaign has been scheduled for publication',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb'
          });
        },
        error: (error) => {
          console.error('Error launching campaign:', error);
          this.showError('Failed to launch campaign');
        }
      });
    }
  }

  async deleteWorkspace(workspace: Workspace) {
    const result = await Swal.fire({
      title: 'Delete Campaign?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      this.workspaceService.deleteWorkspace(workspace.id).subscribe({
        next: () => {
          this.workspaces = this.workspaces.filter(w => w.id !== workspace.id);
          Swal.fire({
            title: 'Deleted!',
            text: 'Campaign has been deleted successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#2563eb'
          });
        },
        error: (error) => {
          console.error('Error deleting workspace:', error);
          this.showError('Failed to delete campaign');
        }
      });
    }
  }

  private showError(message: string) {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb'
    });
  }
}