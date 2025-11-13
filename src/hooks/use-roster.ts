// React Query hook for roster with trust headers
import { useQuery } from '@tanstack/react-query';
import { fetchWithTrust } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { RosterResponse } from '@/types/roster';

export function useRoster(leagueKey: string | null) {
  const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || '';

  return useQuery<ApiResponse<RosterResponse>>({
    queryKey: ['roster', leagueKey],
    queryFn: async () => {
      if (!leagueKey) {
        throw new Error('League key required');
      }

      const url = `${apiBase}/api/yahoo/roster/${leagueKey}`;
      return fetchWithTrust<RosterResponse>(url, {
        credentials: 'include',
        headers: { accept: 'application/json' },
      });
    },
    enabled: !!leagueKey && !!apiBase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
