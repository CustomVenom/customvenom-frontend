import { Badge } from '@/components/ui/Badge';
import { toReasonChips } from '@/lib/reasons/adapter';

export function ReasonChipsAdapter({ reasons }: { reasons: unknown }) {
  const chips = toReasonChips(reasons);
  if (!chips.length) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c, i) => {
        // Format percentage: handle negative zero and add + sign for positive
        const sign = c.effectPct > 0 ? '+' : '';
        const formatted = `${sign}${c.effectPct.toFixed(1)}%`;
        
        return (
          <Badge 
            key={`${c.label}-${i}`}
            intent={c.type === 'positive' ? 'positive' : c.type === 'warning' ? 'warning' : 'neutral'}
          >
            {c.label} {formatted}
          </Badge>
        );
      })}
    </div>
  );
}

