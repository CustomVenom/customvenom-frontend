// src/lib/tools.ts
import type { Reason } from '@/lib/types';

export type Row = {
  player_id: string;
  player_name: string;
  team: string;
  position: string;
  range: { p10: number; p50: number; p90: number };
  confidence?: number;
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

// API Explanation type from backend
export type ApiExplanation = {
  type: 'method' | 'sources' | 'reason';
  text: string;
  confidence: number;
};

// API Projection type from backend
export type ApiProjection = {
  player_id: string;
  team?: string;
  floor?: number;
  median?: number;
  ceiling?: number;
  confidence?: number;
  explanations?: ApiExplanation[];
  position?: string;
  range?: { p10?: number; p50?: number; p90?: number };
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | ApiExplanation[]
    | { p10?: number; p50?: number; p90?: number };
};

// API Response type
export type ApiProjectionsResponse = {
  schema_version: string;
  last_refresh: string;
  projections: ApiProjection[];
};

// Map API explanation to frontend Reason
export function mapExplanationToReason(explanation: ApiExplanation): Reason {
  // Extract delta from text if present (e.g., "+3.4%" or "-2.1%")
  const deltaMatch = explanation.text.match(/[+-]?(\d+\.?\d*)%/);
  const deltaPoints = deltaMatch ? parseFloat(deltaMatch[1]) / 100 : 0;

  // Extract component/icon from type or text
  const componentMap: Record<string, string> = {
    method: '⚙️',
    sources: '📊',
    reason: '💡',
  };
  const component = componentMap[explanation.type] || '📈';

  return {
    component,
    delta_points: Math.max(-0.04, Math.min(0.04, deltaPoints)), // Clamp to ±4%
    confidence: explanation.confidence,
  };
}

// Map API projection to Row
export function mapApiProjectionToRow(
  apiProj: ApiProjection,
  schemaVersion: string,
  lastRefresh: string,
): Row {
  // Extract player name from player_id (e.g., "espn:12345" -> extract if available)
  const playerName = apiProj.player_id.split(':').pop() || apiProj.player_id;

  // Map floor/median/ceiling to range
  const floor = apiProj.floor ?? apiProj.range?.p10 ?? 0;
  const median = apiProj.median ?? apiProj.range?.p50 ?? 0;
  const ceiling = apiProj.ceiling ?? apiProj.range?.p90 ?? 0;

  // Map explanations
  const explanations = (apiProj.explanations || []).map(mapExplanationToReason);

  return {
    player_id: apiProj.player_id,
    player_name: playerName,
    team: apiProj.team || '',
    position: apiProj.position || '',
    range: { p10: floor, p50: median, p90: ceiling },
    confidence: apiProj.confidence,
    explanations,
    schema_version: schemaVersion,
    last_refresh: lastRefresh,
  };
}

export async function fetchProjections(params?: Record<string, string>) {
  const base = process.env['NEXT_PUBLIC_API_BASE'] || '';
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  const res = await fetch(`${base}/projections${qs}`, { cache: 'no-store' });
  const requestId = res.headers.get('x-request-id') || '';
  const body: ApiProjectionsResponse = await res.json();
  return { ok: res.ok, status: res.status, requestId, body };
}

// no-op background warmer for prod safety
export async function warmProjectionsCacheBackground(_opts?: { week?: string }) {
  return Promise.resolve();
}
