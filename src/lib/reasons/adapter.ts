// src/lib/reasons/adapter.ts
import { parseRawReasons } from './schema';

export type ReasonType = 'positive' | 'warning' | 'neutral';

export interface RawReason {
  key: string;           // e.g., "market_delta:up"
  label?: string;        // optional friendly label from API
  effect?: number;       // decimal percent, e.g., 0.021 = +2.1%
}

export interface ReasonChip {
  label: string;
  effectPct: number;     // clamped percent, e.g., 2.1
  type: ReasonType;      // maps to your Badge intents
}

// Hard cap for visible effect
const MAX_ABS_EFFECT = 3.5; // percent
const MAX_CHIPS = 2;

function clampPct(v: number, maxAbs = MAX_ABS_EFFECT): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(-maxAbs, Math.min(maxAbs, v));
}

function inferType(effectPct: number): ReasonType {
  if (effectPct > 0.001) return 'positive';
  if (effectPct < -0.001) return 'warning';
  return 'neutral';
}

// Optional friendly label map by key prefix or exact key
const LABEL_MAP: Record<string, string> = {
  'market_delta:up': 'Market trend up',
  'market_delta:down': 'Market trend down',
  'injury:workload_guard': 'Workload guardrail',
  'usage:increase': 'Usage ↑',
  'usage:decrease': 'Usage ↓',
  'weather:adverse': 'Weather ↓',
  'weather:favorable': 'Weather ↑',
  'matchup:favorable': 'Favorable matchup',
  'matchup:difficult': 'Tough matchup',
};

export function toReasonChips(raw: unknown): ReasonChip[] {
  // Use Zod to safely parse input
  const safe = parseRawReasons(raw);
  if (!safe.length) return [];

  // Normalize → compute absolute impact for sorting
  const normalized = safe.map((r, index) => {
    // API may send decimal fraction (0.021) or percent (2.1). Detect by magnitude.
    const rawVal = Number(r.effect ?? 0);

    // Safety: Handle NaN/Infinity
    if (!Number.isFinite(rawVal)) {
      return {
        key: r.key,
        label: r.label || LABEL_MAP[r.key] || humanizeKey(r.key),
        effectPct: 0,
        abs: 0,
        index, // For stable sorting
      };
    }

    // Improved heuristic: values < 1.0 are fractions (0.021 = 2.1%), >= 1.0 are percents
    // Edge case: 0.5 would be 50% (fraction), but this is more intuitive than the alternative
    const asPct = Math.abs(rawVal) < 1.0 ? rawVal * 100 : rawVal;
    const clamped = clampPct(asPct);

    // Fix negative zero: -0 should display as 0
    const normalized = Object.is(clamped, -0) ? 0 : clamped;

    const label = r.label || LABEL_MAP[r.key] || humanizeKey(r.key);
    return {
      key: r.key,
      label,
      effectPct: normalized,
      abs: Math.abs(normalized),
      index, // For stable sorting
    };
  });

  // Filter out zero-effect chips (no value to user)
  const nonZero = normalized.filter(n => Math.abs(n.effectPct) > 0.01);

  // If all effects are ~0, return empty
  if (!nonZero.length) return [];

  // Sort by absolute magnitude desc, then by original index for stability
  const top = nonZero
    .sort((a, b) => {
      const diff = b.abs - a.abs;
      return diff !== 0 ? diff : a.index - b.index; // Stable sort
    })
    .slice(0, MAX_CHIPS);

  // Final map to chip type
  return top.map(t => ({
    label: t.label,
    effectPct: t.effectPct,
    type: inferType(t.effectPct),
  }));
}

function humanizeKey(key: string): string {
  // "market_delta:up" → "Market delta (up)"
  const [base, suffix] = key.split(':');
  if (!base) return key; // fallback if split fails
  const basePretty = base.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return suffix ? `${basePretty} (${suffix})` : basePretty;
}

