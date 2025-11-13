import type { Provider, LeagueKey, LeagueSummary } from '@/types/leagues';

function leagueKey(provider: Provider, leagueId: string, teamId: string): LeagueKey {
  return `${provider}:${leagueId}:${teamId}`;
}

// Minimal fetch helper (no-store + request_id)
async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      'x-request-id': crypto.randomUUID(),
      'cache-control': 'no-store',
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Upstream ${res.status} ${url}\n${body}`);
  }
  return res.json() as Promise<T>;
}

// ADAPTER: Yahoo via Workers API
// Expectation: Workers exposes a read endpoint using cv_yahoo cookie (canonical cookie name)
// Example endpoint: GET /api/providers/yahoo/leagues
type YahooLeagueDto = {
  league_id: string;
  league_name: string;
  season: string;
  teams: { team_id: string; team_name: string }[];
};

type YahooLeaguesResponse = {
  leagues: YahooLeagueDto[];
};

export interface ProviderAdapter {
  listLeagues(): Promise<LeagueSummary[]>;
  // listTeams?(leagueId: string): Promise<...>
  // getRoster?(leagueId: string, teamId: string): Promise<...>
}

export function getYahooAdapter(apiBase: string): ProviderAdapter {
  return {
    async listLeagues(): Promise<LeagueSummary[]> {
      // Call Workers API; it reads cv_yahoo cookie from request headers
      const data = await apiJson<YahooLeaguesResponse>(`${apiBase}/yahoo/leagues?format=json`);
      const out: LeagueSummary[] = [];
      for (const lg of data.leagues ?? []) {
        // One entry per team the user controls in that league
        for (const t of lg.teams ?? []) {
          out.push({
            key: leagueKey('yahoo', lg.league_id, t.team_id),
            provider: 'yahoo',
            external_league_id: lg.league_id,
            team_id: t.team_id,
            name: lg.league_name,
            season: lg.season,
            team_name: t.team_name,
          });
        }
      }
      return out;
    },
  };
}

// Stubs for other providers (can fill in later)
export function getSleeperAdapter(_apiBase: string): ProviderAdapter {
  return {
    async listLeagues() {
      return [];
    },
  };
}

export function getEspnAdapter(_apiBase: string): ProviderAdapter {
  return {
    async listLeagues() {
      return [];
    },
  };
}
