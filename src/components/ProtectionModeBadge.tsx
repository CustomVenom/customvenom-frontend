'use client';

interface ProtectionModeBadgeProps {
  isStale?: boolean;
  className?: string;
}

export default function ProtectionModeBadge({
  isStale = false,
  className = ''
}: ProtectionModeBadgeProps) {
  if (!isStale) return null;

  return (
    <div
      data-testid="protection-mode-badge"
      role="status"
      aria-label="Protection mode active"
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 ${className}`}
    >
      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
      Protection mode
    </div>
  );
}
