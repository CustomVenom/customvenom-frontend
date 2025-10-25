export type Reason = {
  label: string;
  effect: number; // signed percent, e.g. +1.2 or -0.8
  confidence: number; // 0..1
};

/**
 * Clamp reasons for display:
 * - filter by confidence ≥ 0.65
 * - sort by |effect| desc
 * - keep up to maxChips (default 2)
 * - clamp total visible effect to ±maxAbsTotal (default 3.5%)
 */
export function clampReasons(
  reasons: Reason[],
  { maxChips = 2, maxAbsTotal = 3.5 }: { maxChips?: number; maxAbsTotal?: number } = {},
) {
  const eligible = reasons
    .filter((r) => r.confidence >= 0.65)
    .sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));
  const picked = eligible.slice(0, maxChips);
  // Clamp total absolute effect
  const total = picked.reduce((s, r) => s + r.effect, 0);
  if (Math.abs(total) <= maxAbsTotal) return picked;

  const scale = maxAbsTotal / Math.max(1e-6, Math.abs(total));
  return picked.map((r) => ({ ...r, effect: parseFloat((r.effect * scale).toFixed(2)) }));
}
