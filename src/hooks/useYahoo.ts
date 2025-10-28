'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api';

export function useYahooMe() {
  return useQuery({
    queryKey: ['yahoo', 'me'],
    queryFn: async () => {
      const res = await fetchJson('/yahoo/me');
      if (!res.ok) {
        const reqId = res.requestId || 'unknown';
        console.warn('Yahoo fetch error', {
          path: '/yahoo/me',
          status: 'error',
          request_id: reqId,
          error: res.error,
        });
        throw new Error(res.error);
      }
      return res.data as { guid: string };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useYahooLeagues() {
  return useQuery({
    queryKey: ['yahoo', 'leagues'],
    queryFn: async () => {
      const res = await fetchJson('/yahoo/leagues?format=json');
      if (!res.ok) {
        const reqId = res.requestId || 'unknown';
        console.warn('Yahoo fetch error', {
          path: '/yahoo/leagues',
          status: 'error',
          request_id: reqId,
          error: res.error,
        });
        throw new Error(res.error);
      }
      return res.data as { league_keys: string[] };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
