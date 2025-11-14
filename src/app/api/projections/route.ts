// src/app/api/projections/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // ensure cookies/env available

function trustHeaders(overrides: Partial<Record<string, string>> = {}) {
  const headers = new Headers();
  headers.set('x-schema-version', overrides['x-schema-version'] ?? 'v2.1');
  headers.set('x-last-refresh', overrides['x-last-refresh'] ?? new Date().toISOString());
  headers.set('x-request-id', overrides['x-request-id'] ?? `mock-proj-${Date.now()}`);
  headers.set('x-stale', overrides['x-stale'] ?? 'false');
  return headers;
}

function mockBody() {
  return {
    projections: [
      {
        player_id: 'qb-allen-josh',
        player_name: 'Josh Allen',
        team: 'BUF',
        position: 'QB',
        opponent: 'NYJ',
        floor: 17.2,
        median: 22.8,
        ceiling: 31.4,
        confidence: 0.82,
        explanations: [
          { type: 'matchup', text: 'Favorable secondary', confidence: 0.86 },
          { type: 'usage', text: 'High pass volume', confidence: 0.8 },
        ],
      },
      {
        player_id: 'rb-mccaffrey-christian',
        player_name: 'Christian McCaffrey',
        team: 'SF',
        position: 'RB',
        opponent: 'SEA',
        floor: 12.4,
        median: 18.7,
        ceiling: 27.9,
        confidence: 0.88,
        explanations: [
          { type: 'usage', text: 'Workhorse role', confidence: 0.9 },
          { type: 'matchup', text: 'Red zone advantage', confidence: 0.74 },
        ],
      },
      {
        player_id: 'wr-jefferson-justin',
        player_name: 'Justin Jefferson',
        team: 'MIN',
        position: 'WR',
        opponent: 'CHI',
        floor: 10.1,
        median: 16.3,
        ceiling: 26.1,
        confidence: 0.79,
        explanations: [
          { type: 'pace', text: 'Pace up', confidence: 0.7 },
          { type: 'usage', text: 'Target share spike', confidence: 0.83 },
        ],
      },
    ],
  };
}

export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get('week');
  if (!week) {
    return new Response(JSON.stringify({ error: 'Week parameter is required' }), {
      headers: trustHeaders(),
      status: 400,
    });
  }

  const base = process.env['NEXT_PUBLIC_API_BASE'];

  // If there's no Workers base, return mock with trust headers
  if (!base) {
    return new Response(JSON.stringify(mockBody()), { headers: trustHeaders(), status: 200 });
  }

  // Try Workers, then gracefully fall back to mock on any error
  try {
    const sport = request.nextUrl.searchParams.get('sport') || 'nfl';
    const scoringFormat = request.nextUrl.searchParams.get('scoring_format') || 'half_ppr';
    const leagueKey = request.nextUrl.searchParams.get('league_key');

    const workersParams = new URLSearchParams();
    workersParams.set('week', week);
    workersParams.set('sport', sport);
    workersParams.set('scoring_format', scoringFormat);
    if (leagueKey) workersParams.set('league_key', leagueKey);
    // Pass through enhanced parameter if present
    const enhanced = request.nextUrl.searchParams.get('enhanced');
    if (enhanced === 'true') {
      workersParams.set('enhanced', 'true');
    }

    const upstream = await fetch(`${base}/api/projections?${workersParams.toString()}`, {
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    // Pass through trust headers if present
    const headers = trustHeaders({
      'x-schema-version': upstream.headers.get('x-schema-version') ?? undefined,
      'x-last-refresh': upstream.headers.get('x-last-refresh') ?? undefined,
      'x-request-id': upstream.headers.get('x-request-id') ?? undefined,
      'x-stale': upstream.headers.get('x-stale') ?? undefined,
    });

    if (!upstream.ok) {
      // Return mock body with upstream trust headers and mark stale=true
      headers.set('x-stale', 'true');
      return new Response(JSON.stringify(mockBody()), { headers, status: 200 });
    }

    const json = await upstream.json();
    return new Response(JSON.stringify(json), { headers, status: 200 });
  } catch (err) {
    // On network or parsing error, return mock with trust headers and stale=true
    console.error(
      '[Projections Route] Fallback to mock:',
      err instanceof Error ? err.message : String(err),
    );
    const headers = trustHeaders({
      'x-stale': 'true',
      'x-request-id': `mock-fallback-${Date.now()}`,
    });
    return new Response(JSON.stringify(mockBody()), { headers, status: 200 });
  }
}
