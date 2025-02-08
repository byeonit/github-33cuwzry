import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialPromoContent, GeneratedImage } from '../../../../types';

interface ScheduleItem {
  platform: string;
  contentId: string;
  scheduledAt: string;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Platform Sections -->
      <div *ngFor="let platform of platforms" class="bg-white rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ platform | titlecase }} Schedule
        </h3>

        <!-- Content Selection -->
        <div class="space-y-4">
          <div *ngFor="let content of getContentForPlatform(platform)"
               class="border rounded-lg p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
              <!-- Check if content is of type 'social' -->
      <!-- Check if content is SocialPromoContent using the type guard function -->
      <div *ngIf="isSocialPromoContent(content.data)" class="text-sm text-gray-600">
        {{ content.data.content }}
        <p class="mt-1 text-xs text-gray-400">{{ content.data.hashtags }}</p>
      </div>

      <!-- Check if content is GeneratedImage -->
      <div *ngIf="!isSocialPromoContent(content.data)" class="flex items-center space-x-4">
        <img [src]="content.data.imageUrl"
             [alt]="content.data.prompt"
             class="w-16 h-16 object-cover rounded" />
        <p class="text-sm text-gray-600">{{ content.data.prompt }}</p>
      </div>            
<!--
                <div *ngIf="content.type === 'social'" class="text-sm text-gray-600">
                  {{ content.data.content }}
                  <p class="mt-1 text-xs text-gray-400">{{ content.data.hashtags }}</p>
                </div>
                <div *ngIf="content.type === 'image'" class="flex items-center space-x-4">
                  <img [src]="content.data.imageUrl"
                       [alt]="content.data.prompt"
                       class="w-16 h-16 object-cover rounded" />
                  <p class="text-sm text-gray-600">{{ content.data.prompt }}</p>
                </div>
-->
              </div>

              <!-- Schedule Input -->
              <div class="ml-4 flex items-center space-x-2">
                <input
                  type="datetime-local"
                  [ngModel]="getScheduleForContent(content.id)"
                  (ngModelChange)="updateSchedule(platform, content.id, $event)"
                  class="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                />
                <button
                  *ngIf="getScheduleForContent(content.id)"
                  (click)="removeSchedule(platform, content.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="getContentForPlatform(platform).length === 0"
               class="text-center py-4">
            <p class="text-sm text-gray-500">
              No content selected for {{ platform }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ScheduleComponent {
  @Input() socialContent: SocialPromoContent[] = [];
  @Input() generatedImages: GeneratedImage[] = [];
  @Input() schedules: ScheduleItem[] = [];
  @Output() schedulesChange = new EventEmitter<ScheduleItem[]>();

  platforms = ['instagram', 'facebook', 'pinterest'];

  // Type guard to check if content is SocialPromoContent
  isSocialPromoContent(content: SocialPromoContent | GeneratedImage): content is SocialPromoContent {
    return (content as SocialPromoContent).content !== undefined;
  }

  getContentForPlatform(platform: string) {
    const content: Array<{
      id: string;
      type: 'social' | 'image';
      data: SocialPromoContent | GeneratedImage;
    }> = [];

    // Add social content
    this.socialContent
      .filter(item => item.platform === platform)
      .forEach(item => {
        content.push({ id: item.id, type: 'social', data: item });
      });

    // Add image content
    this.generatedImages
      .filter(item => item.platform === platform)
      .forEach(item => {
        content.push({ id: item.id, type: 'image', data: item });
      });

    return content;
  }

  getScheduleForContent(contentId: string): string | null {
    const schedule = this.schedules.find(s => s.contentId === contentId);
    return schedule ? schedule.scheduledAt : null;
  }

  updateSchedule(platform: string, contentId: string, scheduledAt: string) {
    const updatedSchedules = this.schedules.filter(s => s.contentId !== contentId);
    updatedSchedules.push({ platform, contentId, scheduledAt });
    this.schedulesChange.emit(updatedSchedules);
  }

  removeSchedule(platform: string, contentId: string) {
    const updatedSchedules = this.schedules.filter(s => s.contentId !== contentId);
    this.schedulesChange.emit(updatedSchedules);
  }
}