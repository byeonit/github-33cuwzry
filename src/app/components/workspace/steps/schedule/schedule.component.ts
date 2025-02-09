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
      <!-- Platform Tabs -->
      <div class="flex space-x-4 border-b border-gray-200">
        <button
          *ngFor="let platform of platforms"
          (click)="setActivePlatform(platform)"
          [class]="getTabClasses(platform)"
        >
          {{ platform | titlecase }}
          <span class="ml-2 px-2 py-0.5 text-xs rounded-full"
                [class]="getBadgeClasses(platform)">
            {{ getContentCountForPlatform(platform) }}
          </span>
        </button>
      </div>

      <!-- Content Scheduling -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900">
            {{ activePlatform | titlecase }} Publication Schedule
          </h3>

          <!-- Content List -->
          <div class="space-y-6 mt-4">
            <div *ngFor="let content of getContentForPlatform(activePlatform)"
                 class="border rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Social Content Preview -->
                  <div *ngIf="isSocialContent(content)" class="mb-4">
                    <p class="text-sm text-gray-600">{{ content.content }}</p>
                    <p class="mt-1 text-xs text-gray-400">{{ content.hashtags }}</p>
                  </div>

                  <!-- Image Content Preview -->
                  <div *ngIf="!isSocialContent(content)" class="mb-4">
                    <div class="flex items-center space-x-4">
                      <img [src]="content.image_url"
                           [alt]="content.prompt"
                           class="w-16 h-16 object-cover rounded" />
                      <p class="text-sm text-gray-600">{{ content.prompt }}</p>
                    </div>
                  </div>

                  <!-- Schedule Controls -->
                  <div class="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <!-- Date Picker -->
                    <div class="flex-1">
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Publication Date
                      </label>
                      <input
                        type="date"
                        [min]="getMinDate()"
                        [ngModel]="getScheduleDate(content.id)"
                        (ngModelChange)="updateScheduleDate(content.id, $event)"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                      />
                    </div>

                    <!-- Time Picker -->
                    <div class="flex-1">
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Publication Time
                      </label>
                      <input
                        type="time"
                        [ngModel]="getScheduleTime(content.id)"
                        (ngModelChange)="updateScheduleTime(content.id, $event)"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                      />
                    </div>

                    <!-- Quick Time Slots -->
                    <div class="flex-1">
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Quick Schedule
                      </label>
                      <select
                        (change)="applyQuickSchedule(content.id, $event)"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                      >
                        <option value="">Choose a time slot...</option>
                        <option value="morning">Morning (9:00 AM)</option>
                        <option value="noon">Noon (12:00 PM)</option>
                        <option value="afternoon">Afternoon (3:00 PM)</option>
                        <option value="evening">Evening (6:00 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Remove Schedule Button -->
                <button
                  *ngIf="getScheduleForContent(content.id)"
                  (click)="removeSchedule(activePlatform, content.id)"
                  class="ml-4 text-red-600 hover:text-red-800"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Schedule Status -->
              <div *ngIf="getScheduleForContent(content.id)" class="mt-4 flex items-center text-sm text-gray-500">
                <svg class="h-4 w-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Scheduled for {{ formatSchedule(getScheduleForContent(content.id)) }}
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="getContentForPlatform(activePlatform).length === 0"
                 class="text-center py-8">
              <p class="text-gray-500">
                No content selected for {{ activePlatform | titlecase }}
              </p>
              <p class="mt-2 text-sm text-gray-400">
                Select content in the previous step to schedule it
              </p>
            </div>
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
  activePlatform: string = 'instagram';

  setActivePlatform(platform: string) {
    this.activePlatform = platform;
  }

  getTabClasses(platform: string): string {
    const baseClasses = 'px-4 py-2 text-sm font-medium transition-colors';
    if (platform === this.activePlatform) {
      return `${baseClasses} border-b-2 border-primary text-primary`;
    }
    return `${baseClasses} border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
  }

  getBadgeClasses(platform: string): string {
    if (platform === this.activePlatform) {
      return 'bg-primary bg-opacity-10 text-primary';
    }
    return 'bg-gray-100 text-gray-600';
  }

  getContentCountForPlatform(platform: string): number {
    return this.getContentForPlatform(platform).length;
  }

  getContentForPlatform(platform: string): (SocialPromoContent | GeneratedImage)[] {
    const socialContent = this.socialContent.filter(content => content.platform === platform);
    const images = this.generatedImages.filter(image => image.platform === platform);
    return [...socialContent, ...images];
  }

  isSocialContent(content: SocialPromoContent | GeneratedImage): content is SocialPromoContent {
    return 'content' in content;
  }

  getScheduleForContent(contentId: string): string | null {
    const schedule = this.schedules.find(s => s.contentId === contentId);
    return schedule ? schedule.scheduledAt : null;
  }

  getScheduleDate(contentId: string): string {
    const scheduledAt = this.getScheduleForContent(contentId);
    return scheduledAt ? scheduledAt.split('T')[0] : '';
  }

  getScheduleTime(contentId: string): string {
    const scheduledAt = this.getScheduleForContent(contentId);
    return scheduledAt ? scheduledAt.split('T')[1].substring(0, 5) : '';
  }

  updateScheduleDate(contentId: string, date: string) {
    const currentTime = this.getScheduleTime(contentId) || '09:00';
    this.updateSchedule(this.activePlatform, contentId, `${date}T${currentTime}`);
  }

  updateScheduleTime(contentId: string, time: string) {
    const currentDate = this.getScheduleDate(contentId) || this.getMinDate();
    this.updateSchedule(this.activePlatform, contentId, `${currentDate}T${time}`);
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

  applyQuickSchedule(contentId: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    if (!value) return;

    const currentDate = this.getScheduleDate(contentId) || this.getMinDate();
    let time = '09:00'; // Default to morning

    switch (value) {
      case 'morning':
        time = '09:00';
        break;
      case 'noon':
        time = '12:00';
        break;
      case 'afternoon':
        time = '15:00';
        break;
      case 'evening':
        time = '18:00';
        break;
    }

    this.updateSchedule(this.activePlatform, contentId, `${currentDate}T${time}`);
    select.value = ''; // Reset select
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  formatSchedule(scheduledAt: string | null): string {
    if (!scheduledAt) return '';
    const date = new Date(scheduledAt);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}