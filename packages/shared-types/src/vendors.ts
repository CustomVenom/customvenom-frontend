export interface NflvUsage {
  snap_pct?: number;
  route_pct?: number;
  rush_share?: number;
  target_share?: number;
}

export interface NflvOpportunity {
  air_yards?: number;
  wopr?: number;
  adot?: number;
  racr?: number;
}

export interface NflvEfficiency {
  epa_per_play?: number;
  yprr?: number;
  yac_oe_proxy?: number;
}

export interface NflvContext {
  pace_proxy?: number;
  script_proxy?: number;
  opp_def_rank_proxy?: number;
}

export interface NflvPlayerVendors {
  player_id: string;
  name?: string;
  team?: string;
  position?: string;
  usage?: NflvUsage;
  opportunity?: NflvOpportunity;
  efficiency?: NflvEfficiency;
  context?: NflvContext;
}

export interface NflvWeekVendorsFile {
  schema_version: string;
  week: string;
  last_refresh: string;
  players: NflvPlayerVendors[];
  fresh_at: string;
}
