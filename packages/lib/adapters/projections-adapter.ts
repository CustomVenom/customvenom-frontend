export interface Projection {
  playerId: string;
  name: string;
  team: string;
  position: string;
  opponent?: string | null;
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
  team: string;
  position: string;
  opponent?: string | null;
  floor?: number;
  median?: number;
  ceiling?: number;
  confidence?: number;
  chips?: RawChip[];
  explanations?: RawChip[];
}

interface RawChip {
  driver?: string;
  type?: string;
  label?: string;
  text?: string;
  delta_pct?: number;
  delta_points?: number;
  confidence?: number;
  confidence_score?: number;
}

interface ApiPayload {
  projections?: RawProjection[];
}

export function adaptProjections(payload: ApiPayload | unknown): Projection[] {
  // Map canonical API envelope to UI view model
  // Apply confidence gating and chip limiting per guardrails
  const apiPayload = payload as ApiPayload;
  const list = Array.isArray(apiPayload?.projections) ? apiPayload.projections : [];

  return list
    .map((raw: RawProjection) => ({
      playerId: raw.player_id || raw.playerId,
      name: raw.player_name || raw.name,
      team: raw.team,
      position: raw.position,
      opponent: raw.opponent,
      floor: raw.floor ?? 0,
      median: raw.median ?? 0,
      ceiling: raw.ceiling ?? 0,
      confidence: raw.confidence ?? 0,
      chips: adaptChips(raw.chips || raw.explanations || []),
    }))
    .filter((p: Projection) => p.confidence >= 0.65); // Confidence gating per guardrails
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
      // Accept both legacy (driver/label) and new (type/text) shapes
      const label =
        typeof c?.text === 'string' ? c.text : typeof c?.label === 'string' ? c.label : '';
      const confidence =
        typeof c?.confidence === 'number' ? c.confidence : (c?.confidence_score ?? 0);
      const driver = c?.driver ?? c?.type ?? 'generic';

      // Extract delta_pct: prefer explicit value, then delta_points, then extract from text
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
