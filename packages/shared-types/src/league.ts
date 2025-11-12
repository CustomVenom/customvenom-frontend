export type Provider = 'yahoo' | 'sleeper' | 'espn';

export type LeagueKey = string;

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
  free_slots: number;
  purchased_slots: number;
  max_sync_slots: number;
  used_slots: number;
}

export interface MeLeaguesResponse {
  connections: ProviderConnection[];
  leagues: LeagueSummary[];
  entitlements: Entitlements;
  synced_leagues: LeagueKey[];
  active_league?: LeagueKey | null;
}

export interface LeagueScoringDetails {
  pass_td: number;
  pass_yds: number;
  rush_yds: number;
  rush_td: number;
  rec: number;
  rec_yds: number;
  rec_td: number;
}

export interface LeagueRosterSlots {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  FLEX: number;
  IDP?: number;
  total_starters: number;
}

export interface LeagueContext {
  league_key: string;
  name: string;
  season: string;
  scoring: LeagueScoringDetails;
  roster: LeagueRosterSlots;
  last_refresh: string;
  schema_version: string;
}
