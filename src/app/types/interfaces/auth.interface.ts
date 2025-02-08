import { User } from '@supabase/supabase-js';

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: any;
  error: any;
}