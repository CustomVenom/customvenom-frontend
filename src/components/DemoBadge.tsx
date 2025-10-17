'use client';

interface DemoBadgeProps {
  show: boolean;
}

export default function DemoBadge({ show }: DemoBadgeProps) {
  if (!show) return null;
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium border border-yellow-200 dark:border-yellow-800">
      <span>📊</span>
      <span>Demo data (Golden Week)</span>
    </div>
  );
}

