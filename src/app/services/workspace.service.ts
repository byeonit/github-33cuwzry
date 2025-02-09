import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Workspace, WorkspaceContent, WorkspaceProduct, WorkspaceSchedule } from '../types/interfaces/workspace.interface';
import { GeneratedImage, SocialPromoContent } from '../types';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private supabase = this.authService.getSupabaseClient();

  constructor(private authService: AuthService) {}

  // Workspace CRUD operations
  createWorkspace(name: string): Observable<Workspace> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        const workspaceData = {
          name,
          status: 'draft',
          user_id: user.id
        };

        return from(
          this.supabase
            .from('workspaces')
            .insert([workspaceData])
            .select()
            .single()
        );
      }),
      map(({ data, error }) => {
        if (error) throw error;
        return data as Workspace;
      }),
      catchError(error => {
        console.error('Error creating workspace:', error);
        return throwError(() => new Error('Failed to create workspace'));
      })
    );
  }

  getWorkspaces(): Observable<Workspace[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        return from(
          this.supabase
            .from('workspaces')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        );
      }),
      map(({ data, error }) => {
        if (error) throw error;
        return data as Workspace[];
      }),
      catchError(error => {
        console.error('Error fetching workspaces:', error);
        return throwError(() => new Error('Failed to fetch workspaces'));
      })
    );
  }

  getWorkspaceById(id: string): Observable<Workspace> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        return from(
          this.supabase
            .from('workspaces')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()
        );
      }),
      map(({ data, error }) => {
        if (error) throw error;
        return data as Workspace;
      }),
      catchError(error => {
        console.error('Error fetching workspace:', error);
        return throwError(() => new Error('Failed to fetch workspace'));
      })
    );
  }

  deleteWorkspace(id: string): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        return from(
          this.supabase
            .from('workspaces')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
        );
      }),
      map(({ error }) => {
        if (error) throw error;
      }),
      catchError(error => {
        console.error('Error deleting workspace:', error);
        return throwError(() => new Error('Failed to delete workspace'));
      })
    );
  }

  // Product selection operations
  getWorkspaceProducts(workspaceId: string): Observable<WorkspaceProduct[]> {
    return from(
      this.supabase
        .from('workspace_products')
        .select('*')
        .eq('workspace_id', workspaceId)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkspaceProduct[];
      }),
      catchError(error => {
        console.error('Error fetching workspace products:', error);
        return throwError(() => new Error('Failed to fetch workspace products'));
      })
    );
  }

  addProductToWorkspace(workspaceId: string, productId: string): Observable<WorkspaceProduct> {
    return from(
      this.supabase
        .from('workspace_products')
        .insert([{ workspace_id: workspaceId, product_id: productId }])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkspaceProduct;
      }),
      catchError(error => {
        console.error('Error adding product to workspace:', error);
        return throwError(() => new Error('Failed to add product to workspace'));
      })
    );
  }

  // Content selection operations
  getWorkspaceContent(workspaceId: string): Observable<WorkspaceContent[]> {
    return from(
      this.supabase
        .from('workspace_content')
        .select('*')
        .eq('workspace_id', workspaceId)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkspaceContent[];
      }),
      catchError(error => {
        console.error('Error fetching workspace content:', error);
        return throwError(() => new Error('Failed to fetch workspace content'));
      })
    );
  }

  addContentToWorkspace(
    workspaceId: string,
    contentType: 'social' | 'image',
    contentId: string
  ): Observable<WorkspaceContent> {
    return from(
      this.supabase
        .from('workspace_content')
        .insert([{
          workspace_id: workspaceId,
          content_type: contentType,
          content_id: contentId
        }])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkspaceContent;
      }),
      catchError(error => {
        console.error('Error adding content to workspace:', error);
        return throwError(() => new Error('Failed to add content to workspace'));
      })
    );
  }

  // Schedule operations
  getWorkspaceSchedules(workspaceId: string): Observable<WorkspaceSchedule[]> {
    return from(
      this.supabase
        .from('workspace_schedules')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('scheduled_at', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkspaceSchedule[];
      }),
      catchError(error => {
        console.error('Error fetching schedules:', error);
        return throwError(() => new Error('Failed to fetch schedules'));
      })
    );
  }

  createSchedule(
    workspaceId: string,
    platform: string,
    contentId: string,
    scheduledAt: string
  ): Observable<WorkspaceSchedule> {
    return from(
      this.supabase
        .from('workspace_schedules')
        .insert([{
          workspace_id: workspaceId,
          platform,
          content_id: contentId,
          scheduled_at: scheduledAt,
          status: 'pending'
        }])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as WorkspaceSchedule;
      }),
      catchError(error => {
        console.error('Error creating schedule:', error);
        return throwError(() => new Error('Failed to create schedule'));
      })
    );
  }

  // Workspace status management
  updateWorkspaceStatus(workspaceId: string, status: string): Observable<Workspace> {
    return from(
      this.supabase
        .from('workspaces')
        .update({ status })
        .eq('id', workspaceId)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Workspace;
      }),
      catchError(error => {
        console.error('Error updating workspace status:', error);
        return throwError(() => new Error('Failed to update workspace status'));
      })
    );
  }

  getWorkspaceSelectedSocialContent(contentId: string): Observable<SocialPromoContent[]> {
    return from(
      this.supabase
        .from('social_content')
        .select('*')
        .eq('id', contentId)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as SocialPromoContent[];
      })
    );
  }

    getWorkspaceSelectedGeneratedImages(imageId: string): Observable<GeneratedImage[]> {
      return from(
        this.supabase
          .from('generated_images')
          .select('*')
          .eq('id', imageId)
          .order('created_at', { ascending: false })
      ).pipe(
        map(({ data, error }) => {
          if (error) throw error;
          return data as GeneratedImage[];
        })
      );
    }
  
}