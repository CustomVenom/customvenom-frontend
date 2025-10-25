// src/lib/tools.ts
import type { Reason } from '@/lib/types';

export type Row = {
  player_id: string;
  player_name: string;
  team: string;
  position: string;
  range: { p10: number; p50: number; p90: number };
  explanations: Reason[];
  schema_version: string;
  last_refresh: string;
};

export function clampChips(chips: Reason[], maxVisible = 2): Reason[] {
  return chips
    .filter((c) => c.confidence >= 0.65)
    .sort((a, b) => Math.abs(b.delta_points) - Math.abs(a.delta_points))
    .slice(0, maxVisible)
    .map((c) => ({ ...c, delta_points: Math.max(-0.04, Math.min(0.04, c.delta_points)) }));
}

export async function fetchProjections(params?: Record<string, string>) {
  const base = process.env['NEXT_PUBLIC_API_BASE'] || '';
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  const res = await fetch(`${base}/projections${qs}`, { cache: 'no-store' });
  const requestId = res.headers.get('x-request-id') || '';
  const body = await res.json();
  return { ok: res.ok, status: res.status, requestId, body };
}

// no-op background warmer for prod safety
export async function warmProjectionsCacheBackground(_opts?: { week?: string }) {
  return Promise.resolve();
}
