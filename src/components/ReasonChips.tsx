// ReasonChips component - displays max 2 chips with confidence >= 0.65
'use client';

import { Badge } from '@/components/ui/badge';
import type { Reason } from '@/lib/types';

// Export Reason type for backward compatibility
export type { Reason };

interface ReasonChipsProps {
  explanations?: Reason[];
  reasons?: Reason[]; // Backward compatibility alias
  maxChips?: number;
  minConfidence?: number;
}

export function ReasonChips({
  explanations,
  reasons,
  maxChips = 2,
  minConfidence = 0.65,
}: ReasonChipsProps) {
  // Support both prop names for backward compatibility
  const chips = explanations || reasons || [];
  if (!chips || chips.length === 0) {
    return null;
  }

  // Filter by confidence and limit to max chips
  const visibleChips = chips.filter((chip) => chip.confidence >= minConfidence).slice(0, maxChips);

  if (visibleChips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {visibleChips.map((chip, idx) => (
        <Badge key={idx} variant={getConfidenceVariant(chip.confidence)} className="text-xs">
          {formatChipText(chip)}
        </Badge>
      ))}
    </div>
  );
}

function getConfidenceVariant(confidence: number | undefined) {
  if (!confidence) return 'outline';
  if (confidence >= 0.75) return 'default';
  if (confidence >= 0.65) return 'secondary';
  return 'outline';
}

function formatChipText(chip: Reason) {
  const delta = chip.delta_points;
  const sign = delta > 0 ? '+' : '';
  if (chip.unit === 'points') {
    return `${chip.component} ${sign}${Math.abs(delta).toFixed(1)} pts`;
  }
  // Default to percentage
  const deltaPct = chip.unit === 'percent' ? delta * 100 : delta;
  return `${chip.component} ${sign}${Math.abs(deltaPct).toFixed(1)}%`;
}
