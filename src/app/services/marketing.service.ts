import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CampaignAnalytics, MarketingCampaign, MarketingContent } from '../types';

@Injectable({
  providedIn: 'root',
})
export class MarketingService {
  private supabase = this.authService.getSupabaseClient();

  constructor(private authService: AuthService) {}

  // Marketing Content methods
  addMarketingContent(
    title: string,
    description: string
  ): Observable<MarketingContent> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('User not authenticated'));
    }

    return from(
      this.supabase
        .from('marketing_content')
        .insert([{ title, description }])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as MarketingContent;
      })
    );
  }

  getMarketingContent(): Observable<MarketingContent[]> {
    return from(
      this.supabase
        .from('marketing_content')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as MarketingContent[];
      })
    );
  }

  searchMarketingContent(query: string): Observable<MarketingContent[]> {
    if (!query.trim()) {
      return this.getMarketingContent();
    }

    const searchTerm = `%${query.trim()}%`;
    return from(
      this.supabase
        .from('marketing_content')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as MarketingContent[];
      })
    );
  }

  updateMarketingContent(
    id: string,
    title: string,
    description: string
  ): Observable<MarketingContent> {
    return from(
      this.supabase
        .from('marketing_content')
        .update({ title, description })
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as MarketingContent;
      })
    );
  }

  deleteMarketingContent(id: string): Observable<void> {
    return from(
      this.supabase.from('marketing_content').delete().eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  // Campaign methods
  addCampaign(
    campaign: Partial<MarketingCampaign>
  ): Observable<MarketingCampaign> {
    return from(
      this.supabase
        .from('marketing_campaigns')
        .insert([campaign])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as MarketingCampaign;
      })
    );
  }

  getCampaignDetails(campaignId: string): Observable<MarketingCampaign> {
    return from(
      this.supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as MarketingCampaign;
      })
    );
  }

  updateCampaign(campaign: MarketingCampaign): Observable<MarketingCampaign> {
    return from(
      this.supabase
        .from('marketing_campaigns')
        .update(campaign)
        .eq('id', campaign.id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as MarketingCampaign;
      })
    );
  }

  deleteCampaign(id: string): Observable<void> {
    return from(
      this.supabase.from('marketing_campaigns').delete().eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  // Analytics methods
  getCampaignAnalytics(
    campaignId: string,
    startDate?: string,
    endDate?: string
  ): Observable<CampaignAnalytics[]> {
    let query = this.supabase
      .from('campaign_analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('date', { ascending: true });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as CampaignAnalytics[];
      })
    );
  }

  getCampaignAnalyticsSummary(campaignId: string): Observable<{
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    avg_engagement_rate: number;
  }> {
    return this.getCampaignAnalytics(campaignId).pipe(
      map((analytics) => {
        const summary = analytics.reduce(
          (acc, curr) => ({
            total_impressions: acc.total_impressions + curr.impressions,
            total_clicks: acc.total_clicks + curr.clicks,
            total_conversions: acc.total_conversions + curr.conversions,
            avg_engagement_rate: acc.avg_engagement_rate + curr.engagement_rate,
          }),
          {
            total_impressions: 0,
            total_clicks: 0,
            total_conversions: 0,
            avg_engagement_rate: 0,
          }
        );

        if (analytics.length > 0) {
          summary.avg_engagement_rate /= analytics.length;
        }

        return summary;
      })
    );
  }

  async getPaginatedCampaigns(
    page: number,
    pageSize: number
  ): Promise<{ data: MarketingCampaign[]; count: number }> {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    console.log('Fetching campaigns with params:', {
      page,
      pageSize,
      from,
      to,
    });
    //console.log("Current user:", this.currentUser.value?.id);

    try {
      const { data, count, error } = await this.supabase
        .from('marketing_campaigns')
        .select('*', { count: 'exact' })
        //   .eq("user_id", this.currentUser.value?.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched campaigns:', { data, count });

      return {
        data: data as MarketingCampaign[],
        count: count || 0,
      };
    } catch (error) {
      console.error('Error fetching paginated campaigns:', error);
      throw error;
    }
  }
}
