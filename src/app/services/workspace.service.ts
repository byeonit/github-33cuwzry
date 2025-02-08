import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Workspace, WorkspaceContent, WorkspaceProduct, WorkspaceSchedule } from '../types/interfaces/workspace.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private supabase = this.authService.getSupabaseClient();

  constructor(private authService: AuthService) {}

  // Workspace CRUD operations
  createWorkspace(name: string): Observable<Workspace> {
    return from(
      this.supabase
        .from('workspaces')
        .insert([{ name, status: 'draft' }])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Workspace;
      })
    );
  }

  getWorkspaces(): Observable<Workspace[]> {
    return from(
      this.supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Workspace[];
      })
    );
  }

  getWorkspaceById(id: string): Observable<Workspace> {
    return from(
      this.supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Workspace;
      })
    );
  }

  // Product selection operations
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
      })
    );
  }

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
      })
    );
  }

  // Content selection operations
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
      })
    );
  }

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
      })
    );
  }

  // Schedule operations
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
      })
    );
  }

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
      })
    );
  }
}