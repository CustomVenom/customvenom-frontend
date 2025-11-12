import type { Position, ScoringFormat } from './enums';
import type { Explanation, ProjectedPoints, ProjectionRange } from './projections';

export interface RosterPlayer {
  player_id: string;
  name: string;
  position: string;
  team: string;
  opponent: string | null;
  projected_points: ProjectedPoints;
  reasons: string[];
  confidence: number;
  status: string | null;
  selected_position?: string;
}

export interface RosterResponse {
  team_name?: string;
  starters: RosterPlayer[];
  bench: RosterPlayer[];
}

export interface MatchupPlayer {
  player_id: string;
  name: string;
  position: string;
  team: string;
  opponent: string | null;
  projected_points: ProjectedPoints;
  reasons: string[];
  confidence: number;
  status: string | null;
  selected_position?: string;
}

export interface MatchupTeam {
  team_key: string;
  team_name: string;
  name: string;
  projected_total: number;
  starters: MatchupPlayer[];
  bench: MatchupPlayer[];
}

export interface MatchupResponse {
  week: number;
  format: ScoringFormat;
  last_updated: string;
  authenticated: boolean;
  your_team: MatchupTeam;
  opponent: MatchupTeam;
  win_probability: number;
  request_id?: string;
}

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
