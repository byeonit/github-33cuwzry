import { Injectable } from '@angular/core';
import { Observable, from, throwError, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CampaignSettingsService } from './campaign-settings.service';
import { ProductService } from './product.service';
import { Workspace, WorkspaceContent, WorkspaceProduct, WorkspaceSchedule } from '../types/interfaces/workspace.interface';
import { GeneratedImage, SocialPromoContent } from '../types';
import { CampaignProvider } from '../types/interfaces/campaign-provider.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private supabase = this.authService.getSupabaseClient();

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private campaignSettingsService: CampaignSettingsService
  ) {}

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

  sendToProvider(workspaceId: string): Observable<void> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        // First get the workspace details
        return this.getWorkspaceById(workspaceId).pipe(
          switchMap(workspace => {
            // Get all related data
            return forkJoin({
              products: this.getWorkspaceProducts(workspaceId),
              content: this.getWorkspaceContent(workspaceId),
              schedules: this.getWorkspaceSchedules(workspaceId),
              providers: this.campaignSettingsService.getCampaignProviders()
            }).pipe(
              switchMap(({ products, content, schedules, providers }) => {
                // Filter active providers
                const activeProviders = providers.filter(p => p.is_active);
                
                if (activeProviders.length === 0) {
                  return throwError(() => new Error('No active campaign providers configured'));
                }

                // Send to each active provider
                const sendOperations = activeProviders.map(provider => 
                  this.sendToSingleProvider(provider, {
                    workspace,
                    products,
                    content,
                    schedules
                  })
                );

                return forkJoin(sendOperations);
              })
            );
          })
        );
      }),
      map(() => void 0),
      catchError(error => {
        console.error('Error sending workspace to providers:', error);
        return throwError(() => new Error('Failed to send workspace to providers'));
      })
    );
  }

  private sendToSingleProvider(
    provider: CampaignProvider,
    data: {
      workspace: Workspace;
      products: WorkspaceProduct[];
      content: WorkspaceContent[];
      schedules: WorkspaceSchedule[];
    }
  ): Observable<any> {
    if (!provider.webhook_url) {
      return throwError(() => new Error('Provider webhook URL not configured'));
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add authentication headers based on provider settings
    const authMethod = provider.settings?.['auth_method'] || 'none';
    switch (authMethod) {
      case 'basic':
        if (provider.settings?.['auth_user'] && provider.settings?.['auth_pass']) {
          const authString = `${provider.settings['auth_user']}:${provider.settings['auth_pass']}`;
          headers['Authorization'] = `Basic ${btoa(authString)}`;
        }
        break;
      case 'header':
        if (provider.settings?.['auth_header_key']) {
          headers[provider.settings['auth_header_key']] = provider.settings['auth_header_value'] || '';
        }
        break;
      case 'jwt':
        if (provider.settings?.['jwt_token']) {
          headers['Authorization'] = `Bearer ${provider.settings['jwt_token']}`;
        }
        break;
    }

    // Load additional content details
    return forkJoin({
      socialContent: this.loadSocialContent(data.content),
      generatedImages: this.loadGeneratedImages(data.content),
      products: this.loadProducts(data.products)
    }).pipe(
      switchMap(({ socialContent, generatedImages, products }) => {
        const payload = {
          action: 'launch_workspace',
          workspace: data.workspace,
          products,
          content: {
            social: socialContent,
            images: generatedImages
          },
          schedules: data.schedules
        };

        return from(fetch(provider.webhook_url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        }));
      }),
      switchMap(response => {
        if (!response.ok) {
          return throwError(() => new Error(`Provider ${provider.provider} returned status ${response.status}`));
        }
        return from(response.json());
      })
    );
  }

  private loadSocialContent(content: WorkspaceContent[]): Observable<SocialPromoContent[]> {
    const socialContentIds = content
      .filter(c => c.content_type === 'social')
      .map(c => c.content_id);

    if (socialContentIds.length === 0) {
      return from([]);
    }

    return from(
      this.supabase
        .from('social_content')
        .select('*')
        .in('id', socialContentIds)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as SocialPromoContent[];
      })
    );
  }

  private loadGeneratedImages(content: WorkspaceContent[]): Observable<GeneratedImage[]> {
    const imageContentIds = content
      .filter(c => c.content_type === 'image')
      .map(c => c.content_id);

    if (imageContentIds.length === 0) {
      return from([]);
    }

    return from(
      this.supabase
        .from('generated_images')
        .select('*')
        .in('id', imageContentIds)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as GeneratedImage[];
      })
    );
  }

  private loadProducts(workspaceProducts: WorkspaceProduct[]): Observable<any[]> {
    const productIds = workspaceProducts.map(wp => wp.product_id);
    return this.productService.getProductsByIds(productIds);
  }
}