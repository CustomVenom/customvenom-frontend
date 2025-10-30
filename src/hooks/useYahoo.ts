'use client';

import { useQuery } from '@tanstack/react-query';

type YahooMe = { user?: { guid?: string } };

export function useYahooMe() {
  const api = process.env['NEXT_PUBLIC_API_BASE']!;
  return useQuery({
    queryKey: ['yahoo', 'me'],
    queryFn: async () => {
      try {
        const r = await fetch(`${api}/yahoo/me`, {
          credentials: 'include',
          headers: { accept: 'application/json' },
          cache: 'no-store',
        });
        if (r.status === 401) {
          return { auth_required: true as const, guid: '' };
        }
        if (r.status >= 500) {
          const reqId = r.headers.get('x-request-id') || 'unknown';
          console.warn('[useYahooMe] /yahoo/me server error', {
            status: r.status,
            request_id: reqId,
          });
          return { auth_required: false as const, guid: '', error: 'server' as const };
        }
        if (!r.ok) {
          const reqId = r.headers.get('x-request-id') || 'unknown';
          console.warn('[useYahooMe] /yahoo/me error', { status: r.status, request_id: reqId });
          return { auth_required: false as const, guid: '', error: 'http_error' as const };
        }
        const data = (await r.json()) as YahooMe;
        return { auth_required: false as const, guid: data.user?.guid ?? '' };
      } catch (error) {
        console.error('[useYahooMe] fetch failed', error);
        return { auth_required: false as const, guid: '', error: 'network' as const };
      }
    },
    retry: false,
    staleTime: 60_000,
    placeholderData: { auth_required: true as const, guid: '' },
    refetchOnMount: 'always',
  });
}

type YahooLeagues = { league_keys?: string[] };

export function useYahooLeagues() {
  const api = process.env['NEXT_PUBLIC_API_BASE']!;
  return useQuery({
    queryKey: ['yahoo', 'leagues'],
    queryFn: async () => {
      try {
        const r = await fetch(`${api}/yahoo/leagues?format=json`, {
          credentials: 'include',
          headers: { accept: 'application/json' },
          cache: 'no-store',
        });
        if (r.status === 401) {
          return { auth_required: true as const, league_keys: [] };
        }
        if (r.status >= 500) {
          const reqId = r.headers.get('x-request-id') || 'unknown';
          console.warn('[useYahooLeagues] /yahoo/leagues server error', {
            status: r.status,
            request_id: reqId,
          });
          return { auth_required: false as const, league_keys: [], error: 'server' as const };
        }
        if (!r.ok) {
          const reqId = r.headers.get('x-request-id') || 'unknown';
          console.warn('[useYahooLeagues] /yahoo/leagues error', {
            status: r.status,
            request_id: reqId,
          });
          return { auth_required: false as const, league_keys: [], error: 'http_error' as const };
        }
        const data = (await r.json()) as YahooLeagues;
        return { auth_required: false as const, league_keys: data.league_keys ?? [] };
      } catch (error) {
        console.error('[useYahooLeagues] fetch failed', error);
        return { auth_required: false as const, league_keys: [], error: 'network' as const };
      }
    },
    retry: false,
    staleTime: 60_000,
    placeholderData: { auth_required: true as const, league_keys: [] },
    refetchOnMount: 'always',
  });
}
