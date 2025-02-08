import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceStepperComponent } from '../../components/workspace/workspace-stepper/workspace-stepper.component';
import { WorkspaceFormComponent } from '../../components/workspace/workspace-form/workspace-form.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, WorkspaceStepperComponent, WorkspaceFormComponent],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create Marketing Campaign</h1>
          <p class="mt-2 text-sm text-gray-500">
            Create a multi-channel marketing campaign by selecting products, content, and scheduling publications.
          </p>
        </div>

        <app-workspace-stepper />
        <app-workspace-form />
      </div>
    </div>
  `
})
export class WorkspaceComponent {}