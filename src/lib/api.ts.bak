// API client with stale header detection

export interface Projection {
  player_id: string;
  name?: string;
  team?: string;
  position?: string;
  stat_name: string;
  projection: number;
  method: string;
  sources_used: number;
  confidence?: number;
  reasons?: string[];
}

export interface ProjectionsResponse {
  data: {
    schema_version: string;
    last_refresh: string;
    projections: Projection[];
  };
  headers: {
    stale: boolean;
    staleAge: string | null;
    key: string | null;
    schemaVersion: string | null;
    lastRefresh: string | null;
  };
}

export async function fetchProjections(week: string): Promise<ProjectionsResponse> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';
  const res = await fetch(`${apiBase}/projections?week=${week}`, { 
    cache: 'no-store' 
  });

  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }

  const data = await res.json();

  return {
    data,
    headers: {
      stale: res.headers.get('x-stale') === 'true',
      staleAge: res.headers.get('x-stale-age'),
      key: res.headers.get('x-key'),
      schemaVersion: res.headers.get('x-schema-version'),
      lastRefresh: res.headers.get('x-last-refresh'),
    },
  };
}

export async function fetchHealth() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';
  const res = await fetch(`${apiBase}/health`, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }

  return res.json();
}

