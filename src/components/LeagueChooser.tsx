'use client';

import { useState } from 'react';

interface League {
  id: string;
  name: string;
}

interface LeagueChooserProps {
  leagues: League[];
  onPick: (id: string) => void;
}

export function LeagueChooser({ leagues, onPick }: LeagueChooserProps) {
  const [selected, setSelected] = useState('');

  const handleChange = (leagueId: string) => {
    setSelected(leagueId);
    localStorage.setItem('cv_last_league', leagueId);
    onPick(leagueId);
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Select a league
      </div>
      <select
        className="mt-2 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
        onChange={(e) => handleChange(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          Choose one…
        </option>
        {leagues.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}

