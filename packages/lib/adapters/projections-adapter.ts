export interface Projection {
  playerId: string;
  name: string;
  team: string;
  position: string;
  opponent: string;
  floor: number;
  median: number;
  ceiling: number;
  confidence: number;
  chips: Chip[];
}

export interface Chip {
  driver: string;
  label: string;
  delta_pct: number;
  confidence: number;
}

interface RawProjection {
  player_id?: string;
  playerId?: string;
  player_name?: string;
  name?: string;
  team?: string;
  position?: string;
  opponent?: string | null;
  floor?: number | string;
  median?: number | string;
  ceiling?: number | string;
  confidence?: number | string;
  chips?: RawChip[];
  explanations?: RawChip[];
  simple_attribution?: { reason: string; confidence: 'high' | 'medium' } | null;
}

interface RawChip {
  driver?: string;
  type?: string;
  label?: string;
  text?: string;
  description?: string; // Backend ExplanationChip uses 'description' field
  delta_pct?: number;
  delta_points?: number;
  confidence?: number;
  confidence_score?: number;
}

interface ApiPayload {
  projections?: RawProjection[];
}

// Type-safe normalization helpers
const toStr = (v: unknown, fallback = ''): string =>
  typeof v === 'string' && v.trim() ? v : fallback;

const toNum = (v: unknown, fallback = 0): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

export function adaptProjections(payload: ApiPayload | unknown): Projection[] {
  // Map canonical API envelope to UI view model
  // Apply confidence gating and chip limiting per guardrails
  const apiPayload = payload as ApiPayload;
  const list: RawProjection[] = Array.isArray(apiPayload?.projections)
    ? apiPayload.projections
    : [];

  return list
    .map((raw: RawProjection): Projection | null => {
      const playerId = toStr(raw.player_id ?? raw.playerId);
      if (!playerId) return null; // Drop rows with no id

      const name = toStr(raw.player_name ?? raw.name, 'Unknown');
      const team = toStr(raw.team, '');
      const position = toStr(raw.position, '');
      const opponent = toStr(raw.opponent, '');

      const floor = toNum(raw.floor, 0);
      const median = toNum(raw.median, 0);
      const ceiling = toNum(raw.ceiling, 0);
      const confidence = toNum(raw.confidence, 0);

      // Prefer explanations array if available (full attribution), otherwise fall back to simple_attribution
      let chips: Chip[] = [];
      const explanationsArray = raw.explanations || raw.chips || [];
      if (Array.isArray(explanationsArray) && explanationsArray.length > 0) {
        // Use explanations array (full attribution with multiple drivers)
        chips = adaptChips(explanationsArray);
      } else if (raw.simple_attribution && raw.simple_attribution.reason) {
        // Fall back to simple_attribution for backward compatibility
        chips = [
          {
            driver: 'attribution',
            label: raw.simple_attribution.reason,
            delta_pct: 0, // No delta in simple attribution
            confidence: raw.simple_attribution.confidence === 'high' ? 0.75 : 0.65,
          },
        ];
      }

      return {
        playerId,
        name,
        team,
        position,
        opponent,
        floor,
        median,
        ceiling,
        confidence,
        chips,
      };
    })
    .filter((p): p is Projection => p !== null && p.confidence >= 0.65); // Confidence gating per guardrails
}

function extractPct(text?: string): number | undefined {
  if (!text) return undefined;
  const m = text.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
  return m ? Number(m[1]) : undefined;
}

function adaptChips(rawChips: RawChip[] | unknown[]): Chip[] {
  const chips = Array.isArray(rawChips) ? rawChips : [];

  // Normalize explanations (defensive layer - accept both legacy and new shapes)
  const normalized = chips
    .filter((c): c is RawChip => c != null && typeof c === 'object') // Filter out null, undefined, and non-objects
    .map((c: RawChip) => {
      // Accept both legacy (driver/label) and new (type/text/description) shapes
      // Backend ExplanationChip uses 'description' field, frontend uses 'label' or 'text'
      const label =
        typeof c?.description === 'string'
          ? c.description
          : typeof c?.text === 'string'
            ? c.text
            : typeof c?.label === 'string'
              ? c.label
              : '';
      const confidence =
        typeof c?.confidence === 'number' ? c.confidence : (c?.confidence_score ?? 0);
      const driver = c?.driver ?? c?.type ?? 'generic';

      // Extract delta_pct: prefer explicit value, then delta_points, then extract from text/description
      const delta_pct =
        typeof c?.delta_pct === 'number'
          ? c.delta_pct
          : typeof c?.delta_points === 'number'
            ? c.delta_points
            : extractPct(label);

      return { driver, label, delta_pct: delta_pct ?? 0, confidence };
    })
    .filter((c) => c.label && c.confidence >= 0.65) // Chip confidence gate + require label
    .slice(0, 2); // Max 2 chips per guardrails

  return normalized.map((c) => ({
    driver: c.driver,
    label: c.label,
    delta_pct: c.delta_pct ?? 0,
    confidence: c.confidence ?? 0,
  }));
}
