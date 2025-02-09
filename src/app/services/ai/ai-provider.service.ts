import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { AIProvider, AIProviderForm } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class AIProviderService {
  private supabase = this.authService.getSupabaseClient();

  constructor(private authService: AuthService) {}

  getAIProviders(): Observable<AIProvider[]> {
    return from(
      this.supabase
        .from('ai_providers')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as AIProvider[];
      }),
      catchError(error => {
        console.error('Error fetching AI providers:', error);
        return throwError(() => new Error('Failed to fetch AI providers'));
      })
    );
  }

  addAIProvider(provider: AIProviderForm): Observable<AIProvider> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user) throw new Error('User not authenticated');
        return { ...provider, user_id: user.id, is_active: true };
      }),
      map(providerData => 
        from(
          this.supabase
            .from('ai_providers')
            .insert([providerData])
            .select()
            .single()
        )
      ),
      map(({ data, error }) => {
        if (error) throw error;
        return data as AIProvider;
      }),
      catchError(error => {
        console.error('Error adding AI provider:', error);
        return throwError(() => new Error('Failed to add AI provider'));
      })
    );
  }

  updateAIProvider(id: string, provider: Partial<AIProviderForm>): Observable<AIProvider> {
    return from(
      this.supabase
        .from('ai_providers')
        .update(provider)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as AIProvider;
      }),
      catchError(error => {
        console.error('Error updating AI provider:', error);
        return throwError(() => new Error('Failed to update AI provider'));
      })
    );
  }

  deleteAIProvider(id: string): Observable<void> {
    return from(
      this.supabase
        .from('ai_providers')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
      catchError(error => {
        console.error('Error deleting AI provider:', error);
        return throwError(() => new Error('Failed to delete AI provider'));
      })
    );
  }
}