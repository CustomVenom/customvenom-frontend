/**
 * Architecture Law #1: Single Source of Truth for Types
 *
 * IMPORTANT: The authoritative source of truth for these types is
 * @customvenom/contracts in the customvenom-workers-api repository.
 *
 * These types are kept here for frontend use, but must match the Zod schemas
 * defined in @customvenom/contracts/src/schemas/common.ts and projections.ts
 *
 * When updating types, update @customvenom/contracts first, then sync here.
 */

import type { DriverComponent, Position, ScoringFormat } from './enums';

export type RawStatProjection = { p10: number; p50: number; p90: number };

export type RawStats = Record<string, RawStatProjection>;

export type ProjectionRange = { p10: number; p50: number; p90: number };

export type ProjectedPoints = { floor: number; median: number; ceiling: number };

export interface BaselineProjection {
  player_id: string;
  position: Position;
  raw_stats?: RawStats;
  confidence?: number;
}

export interface Explanation {
  type: DriverComponent;
  label: string;
  message: string;
  confidence: number;
  delta_pct?: number;
}

export interface ProjectionContract {
  schema_version: 'v2.1';
  last_refresh: string;
  player_id: string;
  position: Position;
  scoring_format: ScoringFormat;
  week: string;
  expected_points: number;
  range: ProjectionRange;
  explanations: Explanation[];
}

export interface EnrichedProjection {
  schema_version: 'v2.1';
  last_refresh: string;
  player_id: string;
  position: Position;
  scoring_format: ScoringFormat;
  week: string;
  opponent?: string | null;
  projected_points: ProjectedPoints;
  range: ProjectionRange;
  expected_points: number;
  explanations: Explanation[];
  confidence: number;
}
