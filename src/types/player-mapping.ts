export interface MappedPlayer {
  yahoo_player_id: string;
  yahoo_name: string;
  nflverse_id: string | null;
  position: string;
  team: string;
  confidence: number; // 0-1
  status: 'mapped' | 'unmapped' | 'low_confidence';
}

export interface MappingStats {
  total: number;
  mapped: number;
  unmapped: number;
  low_confidence: number;
}
