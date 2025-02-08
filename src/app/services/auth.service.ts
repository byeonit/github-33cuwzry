import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResponse, UserCredentials } from '../types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.next(session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  signUp(credentials: UserCredentials): Observable<AuthResponse> {
    return from(this.supabase.auth.signUp(credentials)).pipe(
      map(({ data, error }) => ({
        user: data.user,
        error: error,
      }))
    );
  }

  signIn(credentials: UserCredentials): Observable<AuthResponse> {
    return from(this.supabase.auth.signInWithPassword(credentials)).pipe(
      map(({ data, error }) => ({
        user: data.user,
        error: error,
      }))
    );
  }

  signOut(): Observable<void> {
    return from(this.supabase.auth.signOut()).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}