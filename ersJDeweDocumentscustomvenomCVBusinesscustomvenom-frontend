// ⚠️ LOCKED INTERFACE - Frontend Agent imports this
// Do NOT change after Day 1 without coordinating

export interface ProjectedStats {
  floor: number;
  median: number;
  ceiling: number;
}

export interface PlayerProjection {
  player_id: string;
  player_name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE';
  team: string;
  stats: {
    // QB stats
    pass_yards?: ProjectedStats;
    pass_td?: ProjectedStats;
    int?: ProjectedStats;
    // RB/WR/TE stats
    rush_yards?: ProjectedStats;
    rush_td?: ProjectedStats;
    rec?: ProjectedStats;
    rec_yards?: ProjectedStats;
    rec_td?: ProjectedStats;
    // All positions
    fumbles?: ProjectedStats;
  };
  confidence: number;
}

export interface BaselineProjections {
  week: string;
  generated_at: string;
  projections: PlayerProjection[];
}

// Scoring configuration (from league settings)
export interface ScoringSettings {
  pass_yards_per_point: number;  // e.g., 25 (1 pt per 25 yards)
  pass_td: number;               // e.g., 4 or 6
  int: number;                   // e.g., -2
  rush_yards_per_point: number;  // e.g., 10 (1 pt per 10 yards)
  rush_td: number;               // e.g., 6
  rec: number;                   // 0 (Standard), 0.5 (Half PPR), 1 (Full PPR)
  rec_yards_per_point: number;   // e.g., 10
  rec_td: number;                // e.g., 6
  fumbles: number;               // e.g., -2
}

// API response with calculated fantasy points
export interface ProjectedPoints {
  floor: number;
  median: number;
  ceiling: number;
}

export interface PlayerProjectionWithPoints extends PlayerProjection {
  projected_points: ProjectedPoints;
}
