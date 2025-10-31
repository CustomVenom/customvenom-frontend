export interface PlayerTracking {
  player_id: string;
  player_name: string;
  position: string;
  team: string;
  projected_points: number;
  actual_points: number | null;
  variance: number | null;
  last_updated: string;
}

export interface TrackingWeek {
  week: string;
  season: string;
  players: PlayerTracking[];
}


