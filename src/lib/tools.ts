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
  confidence_metadata?: {
    original_confidence: number;
    decay_applied: number;
    decay_reasons: Record<string, number>;
    expires_in_hours: number;
  };
};

export function clampChips(chips: Reason[], maxVisible = 2): Reason[] {
  return chips
    .filter((c) => c.confidence >= 0.65)
    .sort((a, b) => Math.abs(b.delta_points) - Math.abs(a.delta_points))
    .slice(0, maxVisible);
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
  name?: string;
  player_name?: string;
  team?: string;
  floor?: number;
  median?: number;
  ceiling?: number;
  confidence?: number;
  explanations?: ApiExplanation[];
  position?: string;
  range?: { p10?: number; p50?: number; p90?: number };
  confidence_metadata?: {
    original_confidence: number;
    decay_applied: number;
    decay_reasons: Record<string, number>;
    expires_in_hours: number;
  };
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | ApiExplanation[]
    | { p10?: number; p50?: number; p90?: number }
    | {
        original_confidence: number;
        decay_applied: number;
        decay_reasons: Record<string, number>;
        expires_in_hours: number;
      };
};

// API Response type
export type ApiProjectionsResponse = {
  schema_version: string;
  last_refresh: string;
  projections: ApiProjection[];
};

// TypeScript guard for ApiExplanation (kept for potential future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isApiExplanation(x: unknown): x is { type: string; text: string; confidence: number } {
  return (
    typeof x === 'object' &&
    x !== null &&
    'text' in x &&
    typeof (x as { text: unknown }).text === 'string' &&
    'confidence' in x &&
    typeof (x as { confidence: unknown }).confidence === 'number'
  );
}

// Extract delta percentage from text
function extractDeltaPctFromText(text: string): number | undefined {
  const percentMatch = text.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
  if (percentMatch && percentMatch[1]) {
    return parseFloat(percentMatch[1]);
  }
  return undefined;
}

// Map API explanation to frontend Reason (null-safe)
export function mapExplanationToReason(explanation?: {
  type?: string;
  text?: string;
  confidence?: number;
}): Reason | null {
  if (!explanation || typeof explanation.text !== 'string') {
    return null;
  }

  const pointsMatch = explanation.text.match(/[+-](\d+\.?\d*)\s?pts?/i);
  const percentMatch = explanation.text.match(/[+-](\d+\.?\d*)%/);

  let deltaPoints: number | undefined;
  let unit: Reason['unit'] = undefined;
  if (pointsMatch && pointsMatch[0]) {
    deltaPoints = parseFloat(pointsMatch[0]);
    unit = 'points';
  } else if (percentMatch && percentMatch[0]) {
    deltaPoints = parseFloat(percentMatch[0]) / 100;
    unit = 'percent';
  } else {
    // Try to extract percentage from text
    const extractedPct = extractDeltaPctFromText(explanation.text);
    if (extractedPct !== undefined) {
      deltaPoints = extractedPct / 100;
      unit = 'percent';
    } else {
      deltaPoints = undefined; // No numeric delta found
    }
  }

  const componentMap: Record<string, string> = {
    method: '⚙️',
    sources: '📊',
    reason: '💡',
  };
  const component = componentMap[explanation.type] || '📈';

  return {
    component,
    delta_points: deltaPoints ?? 0, // Default to 0 if no delta found
    confidence: explanation.confidence ?? 0,
    unit,
    hasDelta: deltaPoints !== undefined, // Flag to indicate if delta was found
  };
}

// Map API projection to Row
export function mapApiProjectionToRow(
  apiProj: ApiProjection,
  schemaVersion: string,
  lastRefresh: string,
): Row {
  const playerName =
    apiProj.name ?? apiProj.player_name ?? apiProj.player_id.split(':').pop() ?? apiProj.player_id;

  // Map floor/median/ceiling to range
  const floor = apiProj.floor ?? apiProj.range?.p10 ?? 0;
  const median = apiProj.median ?? apiProj.range?.p50 ?? 0;
  const ceiling = apiProj.ceiling ?? apiProj.range?.p90 ?? 0;

  // Map explanations (null-safe, filter out nulls)
  const explanations = (apiProj.explanations || [])
    .map(mapExplanationToReason)
    .filter((r): r is Reason => r !== null);

  return {
    player_id: apiProj.player_id,
    player_name: playerName,
    team: apiProj.team || '',
    position: apiProj.position || '',
    range: { p10: floor, p50: median, p90: ceiling },
    confidence: apiProj.confidence ?? 0.5,
    explanations,
    schema_version: schemaVersion,
    last_refresh: lastRefresh,
    confidence_metadata: apiProj.confidence_metadata,
  };
}

export async function fetchProjections(params?: Record<string, string>) {
  // Use proxy route /api/projections instead of direct API call
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  const res = await fetch(`/api/projections${qs}`, {
    cache: 'no-store',
    credentials: 'include',
  });
  const requestId = res.headers.get('x-request-id') || '';
  const body: ApiProjectionsResponse = await res.json();
  return { ok: res.ok, status: res.status, requestId, body };
}

// no-op background warmer for prod safety
export async function warmProjectionsCacheBackground(_opts?: { week?: string }) {
  return Promise.resolve();
}
