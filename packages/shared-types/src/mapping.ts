export interface PlayerMapping {
  nflverse_id: string;
  yahoo_id: string;
  player_name: string;
  team: string;
  position: string;
  confidence: number;
  source: 'auto' | 'manual' | 'fuzzy';
}

export interface MappingResult {
  nflverse_id: string | null;
  type: 'player' | 'defense' | 'unmapped';
}

export interface PlayerMappingRow {
  yahoo_player_id: string;
  nflverse_id: string;
  player_name: string;
  position: string;
  team: string;
  confidence: number;
  last_updated: string;
}

export interface YahooRosterPlayer {
  player_key: string;
  name: { full: string };
  display_position: string;
  editorial_team_abbr: string;
}

export interface MappingResponseItem {
  yahoo_player_id: string;
  yahoo_name: string;
  nflverse_id: string | null;
  position: string;
  team: string;
  confidence: number;
  status: 'mapped' | 'unmapped' | 'low_confidence';
}

export interface MappingResponseStats {
  total: number;
  mapped: number;
  unmapped: number;
  low_confidence: number;
}

export interface MappingResponse {
  mapped_players: MappingResponseItem[];
  stats: MappingResponseStats;
}
