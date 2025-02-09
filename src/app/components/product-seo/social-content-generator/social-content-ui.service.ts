import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { ToastConfig } from './social-content-generator.types';
import { AIProvider } from '../../../types';

@Injectable({
  providedIn: 'root'
})
export class SocialContentUIService {
  async showProviderSelector(
    providers: AIProvider[],
    currentProviderId?: string
  ): Promise<string | undefined> {
    if (providers.length === 0) {
      const result = await Swal.fire({
        title: 'No Active Providers',
        text: 'Please configure and activate AI providers in the AI Settings page.',
        icon: 'warning',
        confirmButtonText: 'Go to Settings',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#2563eb',
      });

      if (result.isConfirmed) {
        window.location.href = '/ai-settings';
      }
      return undefined;
    }

    const providerOptions = providers.map(p => ({
      value: p.id,
      text: `${p.provider.toUpperCase()} ${p.settings?.['model'] ? `(${p.settings['model']})` : ''}`
    }));

    const { value: providerId } = await Swal.fire({
      title: 'Select AI Provider',
      input: 'select',
      inputOptions: Object.fromEntries(providerOptions.map(p => [p.value, p.text])),
      inputValue: currentProviderId,
      showCancelButton: true,
      confirmButtonText: 'Select',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select an AI provider';
        }
        return null;
      }
    });

    return providerId;
  }

  async showDeleteConfirmation(): Promise<boolean> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });

    return result.isConfirmed;
  }

  showToast(config: ToastConfig) {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: config.timer || 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    return toast.fire({
      icon: config.icon,
      title: config.title
    });
  }

  showError(title: string, message?: string) {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb'
    });
  }
}