import { ChangeEvent } from 'react';

const OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'half_ppr', label: 'Half PPR' },
  { value: 'full_ppr', label: 'Full PPR' },
];

interface ScoringFormatSelectorProps {
  value: 'standard' | 'half_ppr' | 'full_ppr';
  onChange: (value: 'standard' | 'half_ppr' | 'full_ppr') => void;
  disabled?: boolean;
}

export function ScoringFormatSelector({ value, onChange, disabled }: ScoringFormatSelectorProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value as 'standard' | 'half_ppr' | 'full_ppr';
    onChange(nextValue);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="scoring-format" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Scoring:
      </label>
      <select
        id="scoring-format"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="bg-background-secondary dark:bg-gray-800 border border-border-default dark:border-gray-700 rounded-md px-3 py-2 text-sm text-text-primary dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

