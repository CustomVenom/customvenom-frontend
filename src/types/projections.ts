// Type definitions for player projections

export interface PlayerProjection {
  player_id: string;
  player_name?: string;
  name?: string;
  position: string;
  team: string;
  projected_points?: {
    floor: number;
    median: number;
    ceiling: number;
  };
  floor?: number;
  median?: number;
  ceiling?: number;
  confidence?: number | null;
  opponent?: string | null;
  status?: string | null;
  reasons?: string[];
  confidence_metadata?: {
    original_confidence: number;
    decay_applied: number;
    decay_reasons: Record<string, number>;
    expires_in_hours: number;
  };
}

export interface PlayerProjectionWithPoints extends PlayerProjection {
  projected_points: {
    floor: number;
    median: number;
    ceiling: number;
  };
}
