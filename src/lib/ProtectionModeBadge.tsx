// src/components/ProtectionModeBadge.tsx
// Protection mode badge for stale data indication

import { Tooltip } from '@/components/ui/Tooltip';

interface ProtectionModeBadgeProps {
  isStale?: boolean;
  className?: string;
}

export function ProtectionModeBadge({ isStale, className = '' }: ProtectionModeBadgeProps) {
  if (!isStale) return null;

  return (
    <Tooltip content="Data may be stale due to upstream issues. We're showing cached data to keep the service running.">
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 ${className}`}
      >
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
        Protection Mode
      </div>
    </Tooltip>
  );
}
