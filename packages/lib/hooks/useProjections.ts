'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchWithTrust } from '../fetch-with-trust';
import { adaptProjections } from '../adapters/projections-adapter';

export function useProjections({ sport, week }: { sport: 'nfl' | 'nba'; week: string }) {
  return useQuery({
    queryKey: ['projections', sport, week],
    queryFn: async () => {
      const res = await fetchWithTrust(`/api/projections?sport=${sport}&week=${week}`);
      // Handle both direct data and nested data structure
      const data = res.data?.data || res.data;
      const adapted = adaptProjections(data);
      return {
        projections: adapted,
        schema_version: res.trust.schemaVersion || 'v1',
        last_refresh: res.trust.lastRefresh || new Date().toISOString(),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
