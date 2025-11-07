// src/components/ProtectionModeBadge.tsx
// Protection mode badge for stale data indication

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

interface ProtectionModeBadgeProps {
  isStale?: boolean;
  className?: string;
}

export function ProtectionModeBadge({ isStale, className = '' }: ProtectionModeBadgeProps) {
  if (!isStale) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            data-testid="protection-mode-badge"
            aria-label="Protection mode active"
            className={`inline-flex items-center gap-2 px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs ${className}`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
            Protection mode
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>
          Data may be stale due to upstream issues. We're showing cached data to keep the service running.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ProtectionModeBadge;
