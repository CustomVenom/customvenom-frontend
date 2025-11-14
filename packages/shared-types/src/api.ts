/**
 * Architecture Law #1: Single Source of Truth for Types
 *
 * IMPORTANT: The authoritative source of truth for these types is
 * @customvenom/contracts in the customvenom-workers-api repository.
 *
 * These types are kept here for frontend use, but must match the Zod schemas
 * defined in @customvenom/contracts/src/schemas/api.ts
 *
 * When updating types, update @customvenom/contracts first, then sync here.
 */

export type ApiResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
  requestId: string;
};

export interface FetchResult<T> {
  data: T | null;
  error: string | null;
  headers: Headers;
  status: number;
}

export interface UserPrefs {
  density: 'compact' | 'normal' | 'comfortable';
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
}
