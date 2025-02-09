import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WorkspaceStep } from '../../../types/interfaces/workspace.interface';

@Component({
  selector: 'app-workspace-stepper',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-4 px-6 bg-white shadow-sm rounded-lg mb-6">
      <nav aria-label="Progress">
        <ol role="list" class="space-y-4 md:flex md:space-y-0 md:space-x-8">
          <li class="md:flex-1" *ngFor="let step of steps">
            <button
              [class]="getStepClasses(step)"
              [attr.aria-current]="currentStep === step.step ? 'step' : undefined"
              (click)="onStepClick(step)"
              >
              <span class="flex items-center px-6 py-4 text-sm font-medium">
                <span class="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 rounded-full" 
                      [class]="getCircleClasses(step)">
                  <span>{{ step.step }}</span>
                </span>
                <span class="ml-4 text-sm font-medium" [class]="getTitleClasses(step)">
                  {{ step.title }}
                </span>
              </span>
            </button>
          </li>
        </ol>
      </nav>
    </div>
  `,
})
export class WorkspaceStepperComponent implements OnInit {
  currentStep = 1;
  steps: WorkspaceStep[] = [
    {
      step: 1,
      title: 'Campaign Details',
      description: 'Name your campaign and select products',
      completed: false
    },
    {
      step: 2,
      title: 'Content Selection',
      description: 'Choose AI-generated content',
      completed: false
    },
    {
      step: 3,
      title: 'Schedule',
      description: 'Set publication schedule',
      completed: false
    },
    {
      step: 4,
      title: 'Review',
      description: 'Review and save workspace',
      completed: false
    }
  ];

  ngOnInit() {
    this.updateStepStatus();
  }

  onStepClick(step: WorkspaceStep) {
    if (step.step < this.currentStep || step.step === this.currentStep + 1) {
      this.currentStep = step.step;
      this.updateStepStatus();
    }
  }

  updateStepStatus() {
    this.steps = this.steps.map(step => ({
      ...step,
      completed: step.step < this.currentStep,
      isActive: step.step === this.currentStep || step.step === this.currentStep + 1
    }));
  }

  getStepClasses(step: WorkspaceStep): string {
    const baseClasses = 'group relative flex w-full cursor-pointer rounded-md';
    if (step.step === this.currentStep) {
      return `${baseClasses} border-primary-600`;
    }
    if (step.completed) {
      return `${baseClasses} border-green-600`;
    }
    return `${baseClasses} border-gray-300`;
  }

  getCircleClasses(step: WorkspaceStep): string {
    if (step.step === this.currentStep) {
      return 'border-primary bg-primary text-white';
    }
    if (step.completed) {
      return 'border-green-600 bg-green-600 text-white';
    }
    return 'border-gray-300 text-gray-500';
  }

  getTitleClasses(step: WorkspaceStep): string {
    if (step.step === this.currentStep) {
      return 'text-primary';
    }
    if (step.completed) {
      return 'text-green-600';
    }
    return 'text-gray-500';
  }
}