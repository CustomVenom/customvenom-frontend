// Types
export type ApiResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
  requestId: string;
};

export type TrustBundle = {
  schemaVersion: string;
  lastRefresh: string;
  isStale: boolean;
};

// Unified API client with proper base URL and deduplication
export async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const base = process.env['NEXT_PUBLIC_API_BASE']!;
  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      ...(init.headers || {}),
    },
  });

  const hdrId = res.headers.get('x-request-id') || 'unavailable';
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // Ignore JSON parse errors
  }

  const requestId = (body as { request_id?: string })?.request_id || hdrId || 'unavailable';

  return res.ok
    ? { ok: true, data: body as T, requestId }
    : { ok: false, error: (body as { error?: string })?.error || `http_${res.status}`, requestId };
}

// Helper to extract Trust Bundle headers from response
export function extractTrustBundle(response: Response): TrustBundle {
  return {
    schemaVersion: response.headers.get('x-schema-version') || 'v1',
    lastRefresh: response.headers.get('x-last-refresh') || new Date().toISOString(),
    isStale: response.headers.get('x-stale') === 'true',
  };
}

// Helper to extract request ID from response
export function getReqId(result: ApiResult): string {
  return result.requestId;
}

// Dedup login probe to prevent multiple simultaneous requests
let inFlight: Promise<ApiResult> | null = null;
export function probeYahooMe(): Promise<ApiResult> {
  if (!inFlight) {
    inFlight = fetchJson('/yahoo/me').finally(() => (inFlight = null));
  }
  return inFlight;
}

// Unified CustomVenom API Client
export class CustomVenomAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env['NEXT_PUBLIC_API_BASE'] || '';
    if (!this.baseUrl) {
      console.warn('NEXT_PUBLIC_API_BASE not configured');
    }
  }

  // Core projections
  async getProjections(params: {
    sport?: 'nfl' | 'nba';
    week: string;
    scoring_format?: string;
    league_key?: string;
  }): Promise<ApiResult<{ schema_version: string; last_refresh: string; projections: unknown[] }>> {
    const searchParams = new URLSearchParams();
    searchParams.set('week', params.week);
    if (params.sport) searchParams.set('sport', params.sport);
    if (params.scoring_format) searchParams.set('scoring_format', params.scoring_format);
    if (params.league_key) searchParams.set('league_key', params.league_key);

    return fetchJson(`/api/projections?${searchParams.toString()}`);
  }

  // FAAB Helper
  async getFAABBands(params: {
    player_id?: string;
    budget?: number;
    week?: string;
  }): Promise<ApiResult<{ schema_version: string; last_refresh: string; items: unknown[] }>> {
    const searchParams = new URLSearchParams();
    if (params.player_id) searchParams.set('player_id', params.player_id);
    if (params.budget) searchParams.set('budget', params.budget.toString());
    if (params.week) searchParams.set('week', params.week);

    return fetchJson(`/api/faab?${searchParams.toString()}`);
  }

  // Risk Dial
  async getRiskDial(params: {
    week?: string;
    sport?: string;
  }): Promise<ApiResult<{ schema_version: string; last_refresh: string; risk_level: string }>> {
    const searchParams = new URLSearchParams();
    if (params.week) searchParams.set('week', params.week);
    if (params.sport) searchParams.set('sport', params.sport);

    return fetchJson(`/api/risk-dial?${searchParams.toString()}`);
  }

  // Yahoo OAuth
  async getYahooLeagues(): Promise<ApiResult<{ league_keys?: string[] }>> {
    return fetchJson('/api/yahoo/leagues');
  }

  async getYahooRoster(teamKey: string): Promise<ApiResult<{ roster: unknown[] }>> {
    return fetchJson(`/api/team/${teamKey}/roster`);
  }

  async getYahooTeams(leagueKey: string): Promise<ApiResult<{ teams: unknown[] }>> {
    return fetchJson(`/api/leagues/${leagueKey}/teams`);
  }

  async getYahooStandings(leagueKey: string): Promise<ApiResult<{ standings: unknown[] }>> {
    return fetchJson(`/api/yahoo/leagues/${leagueKey}/standings`);
  }

  // Ops Dashboard
  async getOpsData(): Promise<
    ApiResult<{
      cache: { hits: number; total: number; rate: number };
      coverage: Record<string, number>;
      pinball: Record<string, number>;
      chips: { speak: number; suppress: number };
    }>
  > {
    return fetchJson('/api/ops-data');
  }

  // Health
  async getHealth(): Promise<
    ApiResult<{
      ok: boolean;
      ready: boolean;
      schema_version: string;
      last_refresh: string;
    }>
  > {
    return fetchJson('/api/health');
  }

  // Trust Foundation endpoints
  async getTrustSnapshot(): Promise<
    ApiResult<{
      schema_version: string;
      last_refresh: string;
      is_stale: boolean;
      accuracy_7d?: number;
      predictions_tracked?: number;
      in_range_rate?: number;
    }>
  > {
    return fetchJson('/api/trust/snapshot');
  }

  async getAccuracy(
    timeframe: '7d' | '30d' | 'season' = '7d',
    detailed = false,
  ): Promise<
    ApiResult<{
      accuracy: number;
      sample_size: number;
      overall?: {
        accuracy: number;
        sample: number;
        mae: number;
        bias: number;
      };
      by_position?: Record<string, { accuracy: number; sample: number }>;
      floor_hit_rate?: number;
      ceiling_hit_rate?: number;
    }>
  > {
    return fetchJson(`/api/trust/accuracy?timeframe=${timeframe}&detailed=${detailed}`);
  }

  async getUserROI(
    userId: string,
    season = '2025',
  ): Promise<
    ApiResult<{
      total_points: number;
      breakdown: {
        start_sit?: number;
        waiver?: number;
        lineup_opt?: number;
        ignored?: number;
      };
      win_rate: number;
      decisions_followed: number;
      decisions_total: number;
    }>
  > {
    return fetchJson(`/api/trust/roi?user_id=${userId}&season=${season}`);
  }

  async getDecisionHistory(
    userId: string,
    limit = 50,
  ): Promise<
    ApiResult<{
      decisions: Array<{
        date: string;
        type: string;
        recommended_action: string;
        user_action: string;
        followed: boolean;
        points_diff: number;
        outcome: string;
      }>;
      summary: {
        total: number;
        followed: number;
        follow_rate: number;
        total_points: number;
      };
    }>
  > {
    return fetchJson(`/api/tracking/decisions?user_id=${userId}&limit=${limit}`);
  }

  async trackDecision(decision: {
    sport: string;
    week: string;
    decision_type: string;
    tool_used?: string;
    player_started_id?: string;
    player_benched_id?: string;
    recommended_action: string;
    user_action: string;
  }): Promise<ApiResult<{ success: boolean }>> {
    return fetchJson('/api/tracking/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decision),
    });
  }
}

// Export singleton instance
export const api = new CustomVenomAPI();
