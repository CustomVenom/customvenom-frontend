'use client';

import { useQuery } from '@tanstack/react-query';

type YahooMe = { user?: { guid?: string } };

export function useYahooMe() {
  const api = process.env['NEXT_PUBLIC_API_BASE']!;
  return useQuery({
    queryKey: ['yahoo', 'me'],
    queryFn: async () => {
      const r = await fetch(`${api}/yahoo/me`, {
        credentials: 'include',
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      if (!r.ok) {
        const reqId = r.headers.get('x-request-id') || 'unknown';
        console.warn('[useYahooMe] /yahoo/me error', { status: r.status, request_id: reqId });
        throw new Error(r.status === 401 ? 'auth_required' : 'http_error');
      }
      const data = (await r.json()) as YahooMe;
      return { guid: data.user?.guid ?? '' };
    },
    retry: false,
    staleTime: 60_000,
  });
}

type YahooLeagues = { league_keys?: string[] };

export function useYahooLeagues() {
  const api = process.env['NEXT_PUBLIC_API_BASE']!;
  return useQuery({
    queryKey: ['yahoo', 'leagues'],
    queryFn: async () => {
      const r = await fetch(`${api}/yahoo/leagues?format=json`, {
        credentials: 'include',
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      if (!r.ok) {
        const reqId = r.headers.get('x-request-id') || 'unknown';
        console.warn('[useYahooLeagues] /yahoo/leagues error', {
          status: r.status,
          request_id: reqId,
        });
        throw new Error(r.status === 401 ? 'auth_required' : 'http_error');
      }
      return (await r.json()) as YahooLeagues;
    },
    retry: false,
    staleTime: 60_000,
  });
}
