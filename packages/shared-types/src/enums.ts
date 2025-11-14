/**
 * Architecture Law #1: Single Source of Truth for Types
 *
 * IMPORTANT: The authoritative source of truth for these types is
 * @customvenom/contracts in the customvenom-workers-api repository.
 *
 * These types are kept here for frontend use, but must match the Zod schemas
 * defined in @customvenom/contracts/src/schemas/common.ts
 *
 * When updating types, update @customvenom/contracts first, then sync here.
 */

export type ScoringFormat = 'standard' | 'half_ppr' | 'full_ppr';
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DL' | 'LB' | 'DB' | 'DEF';
export type DriverComponent =
  | 'baseline'
  | 'matchup'
  | 'usage'
  | 'injury'
  | 'weather'
  | 'game_script'
  | 'uncertainty';
