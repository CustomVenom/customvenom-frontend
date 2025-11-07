import { Badge } from '@/components/ui/badge';
import type { Reason } from '@/lib/types';

interface ExplanationChipsProps {
  explanations: Reason[];
}

export function ExplanationChips({ explanations }: ExplanationChipsProps) {
  if (!explanations || explanations.length === 0) {
    return null;
  }

  const chips = explanations.slice(0, 2);

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {chips.map((chip, idx) => (
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
  return `${chip.component} ${sign}${(Math.abs(delta) * 100).toFixed(1)}%`;
}

