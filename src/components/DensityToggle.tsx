'use client';
import { useDensity } from '@/hooks/useDensity';

interface DensityToggleProps {
  value?: 'comfortable' | 'compact';
  onValueChange?: (value: 'comfortable' | 'compact') => void;
}

export default function DensityToggle({ value, onValueChange }: DensityToggleProps = {}) {
  const { dense, toggle } = useDensity();

  // Use controlled value if provided, otherwise use hook value
  const isDense = value !== undefined ? value === 'compact' : dense;
  const handleToggle = () => {
    if (onValueChange) {
      onValueChange(isDense ? 'comfortable' : 'compact');
    } else {
      toggle();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
      aria-pressed={isDense}
      aria-label="Toggle density"
    >
      <span className="font-medium">{isDense ? 'Compact' : 'Comfortable'}</span>
    </button>
  );
}
