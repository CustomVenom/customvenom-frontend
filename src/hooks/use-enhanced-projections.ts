/**
 * Enhanced Projections Hook
 *
 * Fetches projections with R enhancement data when available.
 * Maps API response to EnhancedPlayerProjection format with proper null handling.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchWithTrust } from '@customvenom/lib/fetch-with-trust';
import { useUserStore } from '@/lib/store';
import { getCurrentWeek } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { EnhancedPlayerProjection } from '@/lib/types/decision';

interface ProjectionsResponse {
  projections: Array<{
    player_id: string;
    player_name?: string;
    name?: string;
    team?: string;
    position: string;
    projected_points?: {
      floor: number;
      median: number;
      ceiling: number;
    };
    floor?: number;
    median?: number;
    ceiling?: number;
    confidence?: number;
    enhanced_floor?: number | null;
    enhanced_ceiling?: number | null;
    enhanced_confidence?: number | null;
    enhancement_method?: string;
    historical_games?: number | null;
    explanations?: Array<{
      type: string;
      description: string;
      confidence: number;
    }>;
    reasons?: Array<{
      text: string;
      sentiment?: 'positive' | 'negative' | 'neutral';
      impact?: 'high' | 'medium' | 'low';
    }>;
  }>;
  schema_version: string;
  last_refresh: string;
}

export function useEnhancedProjections(week?: string, enhanced = true) {
  const { activeSport, scoringFormat, selectedWeek } = useUserStore();
  const weekToUse = week || selectedWeek || getCurrentWeek();

  return useQuery<ApiResponse<{ projections: EnhancedPlayerProjection[]; last_refresh: string }>>({
    queryKey: ['projections', 'enhanced', activeSport, weekToUse, scoringFormat, enhanced],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('week', weekToUse);
      searchParams.set('sport', activeSport);
      if (scoringFormat) {
        searchParams.set('scoring_format', scoringFormat);
      }
      if (enhanced) {
        searchParams.set('enhanced', 'true');
      }

      const url = `/api/projections?${searchParams.toString()}`;
      const response = await fetchWithTrust<ProjectionsResponse>(url);

      // Map API response to EnhancedPlayerProjection format
      const projections = response.data?.projections || [];
      const enhancedProjections: EnhancedPlayerProjection[] = projections.map((p) => {
        // Determine if we have real enhancement data
        const hasRealEnhancement =
          p.enhanced_floor !== undefined &&
          p.enhanced_floor !== null &&
          p.enhancement_method !== 'fallback' &&
          p.enhancement_method !== 'unavailable';

        // Get projection value (median or fallback)
        const projection =
          p.projected_points?.median ?? p.median ?? p.projected_points?.floor ?? (p as { floor?: number }).floor ?? 0;

        // Map explanations/reasons to DecisionFactor format
        const factors =
          p.reasons?.map((r) => ({
            text: r.text,
            sentiment: r.sentiment || 'neutral',
            impact: r.impact || 'medium',
            description: r.text,
          })) ||
          p.explanations?.map((e) => ({
            text: e.description,
            sentiment: 'neutral' as const,
            impact: 'medium' as const,
            description: e.description,
          })) ||
          [];

        return {
          player_id: p.player_id,
          player_name: p.player_name || p.name || p.player_id,
          team: p.team || 'UNK',
          position: p.position,
          player_image_url: `/api/player-image/${p.player_id}`,
          projection,
          enhanced_floor: hasRealEnhancement ? p.enhanced_floor : null,
          enhanced_ceiling: hasRealEnhancement ? p.enhanced_ceiling : null,
          statistical_confidence: hasRealEnhancement ? p.enhanced_confidence : null,
          historical_games: hasRealEnhancement ? p.historical_games : null,
          is_enhanced: hasRealEnhancement,
          enhancement_method: (p.enhancement_method as any) || 'unavailable',
          factors,
        };
      });

      return {
        ...response,
        data: {
          projections: enhancedProjections,
          last_refresh: response.data?.last_refresh || new Date().toISOString(),
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000,
    retry: 2,
  });
}
