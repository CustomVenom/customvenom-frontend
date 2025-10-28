'use client';
import { useEffect, useState } from 'react';

const ALLOWED = ['nfl', 'nba', 'mlb', 'nhl'] as const;
type Sport = (typeof ALLOWED)[number];

export function SportChooserHidden({
  value = 'nfl',
  onChange,
}: {
  value?: Sport;
  onChange: (v: Sport) => void;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Reveal only when both conditions hold:
    // 1) env flag on, AND 2) local dev toggle set.
    const envOn = process.env['NEXT_PUBLIC_ENABLE_MULTI_SPORT'] === 'true';
    const localOn = typeof window !== 'undefined' && localStorage.getItem('cv:multiSport') === 'on';
    setEnabled(envOn && localOn);
  }, []);

  if (!enabled) return null;

  return (
    <div className="flex items-center gap-2 text-xs opacity-75 mb-2" data-testid="sport-chooser">
      <label className="sr-only" htmlFor="sport">
        Sport
      </label>
      <select
        id="sport"
        value={value}
        onChange={(e) => {
          const v = e.target.value as Sport;
          onChange(ALLOWED.includes(v) ? v : 'nfl');
        }}
        className="rounded border px-2 py-1"
      >
        {ALLOWED.map((s) => (
          <option key={s} value={s}>
            {s.toUpperCase()}
          </option>
        ))}
      </select>
      <span className="text-amber-700">hidden</span>
    </div>
  );
}
