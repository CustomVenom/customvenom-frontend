import { Badge } from '@/components/ui/badge';
import { clampReasons, Reason } from '@/lib/reasonsClamp';

// Re-export Reason type for convenience
export type { Reason } from '@/lib/reasonsClamp';

/**
 * ReasonChips: Boundary enforcement
 * - Max 2 chips per row
 * - Confidence ≥ 0.65
 * - Total |Δ| ≤ 4%
 */
export function ReasonChips({ reasons }: { reasons: Reason[] }) {
  const clamped = clampReasons(reasons, { maxChips: 2, maxAbsTotal: 4.0 });
  if (!clamped.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {clamped.map((r, index) => (
        <Badge key={`${r.label}-${index}`} intent={r.effect >= 0 ? 'positive' : 'warning'}>
          {r.label} {r.effect > 0 ? `+${r.effect}%` : `${r.effect}%`}
        </Badge>
      ))}
    </div>
  );
}
