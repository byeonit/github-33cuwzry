import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { PinterestBoardsProvider } from '../types/product-provider.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductSettingsService {
  private supabase = this.authService.getSupabaseClient();

  constructor(private authService: AuthService) {}

  getPinterestBoardsProviders(): Observable<PinterestBoardsProvider[]> {
    return from(
      this.supabase
        .from('pinterest_boards')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as PinterestBoardsProvider[];
      }),
      catchError(error => {
        console.error('Error fetching pinterest boards:', error);
        return throwError(() => new Error('Failed to fetch pinterest boards'));
      })
    );
  }

}