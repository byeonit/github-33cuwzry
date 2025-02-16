import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CampaignProvider, CampaignProviderForm } from '../types/interfaces/campaign-provider.interface';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class CampaignSettingsService {
  private supabase = this.authService.getSupabaseClient();

  constructor(private authService: AuthService) {}

  getCampaignProviders(): Observable<CampaignProvider[]> {
    return from(
      this.supabase
        .from('campaign_providers')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as CampaignProvider[];
      }),
      catchError(error => {
        console.error('Error fetching campaign providers:', error);
        return throwError(() => new Error('Failed to fetch campaign providers'));
      })
    );
  }

  addCampaignProvider(provider: CampaignProviderForm): Observable<CampaignProvider> {
    return this.authService.getCurrentUser().pipe(
      /*
      map(user => {
        if (!user) throw new Error('User not authenticated');
        return { ...provider, user_id: user.id, is_active: true };
      }),
      map(providerData => 
        from(
          this.supabase
            .from('campaign_providers')
            .insert([providerData])
            .select()
            .single()
        ) 
      ),
*/
      map((user: User | null) => {
        if (!user) throw new Error("User not authenticated");
        return user;
      }),
      switchMap((user: User) => {
        const providerData = {
          ...provider,
          user_id: user.id,
          is_active: true,
        };

        return from(
          this.supabase
            .from("campaign_providers")
            .insert([providerData])
            .select()
            .single()
        );
      }),
      map(({ data, error }) => {
        if (error) throw error;
        return data as CampaignProvider;
      }),
      catchError(error => {
        console.error('Error adding campaign provider:', error);
        return throwError(() => new Error('Failed to add campaign provider'));
      })
    );
  }

  updateCampaignProvider(id: string, provider: Partial<CampaignProviderForm>): Observable<CampaignProvider> {
    return from(
      this.supabase
        .from('campaign_providers')
        .update(provider)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as CampaignProvider;
      }),
      catchError(error => {
        console.error('Error updating campaign provider:', error);
        return throwError(() => new Error('Failed to update campaign provider'));
      })
    );
  }

  deleteCampaignProvider(id: string): Observable<void> {
    return from(
      this.supabase
        .from('campaign_providers')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
      catchError(error => {
        console.error('Error deleting campaign provider:', error);
        return throwError(() => new Error('Failed to delete campaign provider'));
      })
    );
  }
}