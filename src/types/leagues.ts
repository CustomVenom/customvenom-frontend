export type Provider = 'yahoo' | 'sleeper' | 'espn';

export type LeagueKey = string; // `${provider}:${external_league_id}:${team_id}`

export interface ProviderConnection {
  provider: Provider;
  guid?: string;
  display_name?: string;
  connected_at: string;
}

export interface LeagueSummary {
  key: LeagueKey;
  provider: Provider;
  external_league_id: string;
  team_id: string;
  name: string;
  season: string;
  team_name: string;
}

export interface Entitlements {
  is_superuser: boolean;
  free_slots: number; // default 1
  purchased_slots: number; // sum of active purchases
  max_sync_slots: number; // derived = free + purchased OR Infinity for superuser
  used_slots: number; // synced_leagues.length
}

export interface MeLeaguesResponse {
  connections: ProviderConnection[];
  leagues: LeagueSummary[];
  entitlements: Entitlements;
  synced_leagues: LeagueKey[];
  active_league?: LeagueKey | null;
}
