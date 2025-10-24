'use client';

import { useEffect, useState } from 'react';
import { LeagueHeaderControls } from './LeagueHeaderControls';
import { LeagueSwitcher } from './LeagueSwitcher';

interface LeaguePageHeaderProps {
  isPro?: boolean;
}

export function LeaguePageHeader({ isPro = false }: LeaguePageHeaderProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leagues')
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!data || !data.leagues || data.leagues.length === 0) {
    return (
      <div className="mb-6">
        <LeagueSwitcher />
      </div>
    );
  }

  const leagues = data.leagues.map((l: any) => ({
    id: l.key,
    name: l.name,
  }));

  const activeId = data.defaultLeagueId || localStorage.getItem('cv_last_league') || undefined;

  const handleChange = async (id: string) => {
    localStorage.setItem('cv_last_league', id);
    
    // Optionally POST to server (stub for now)
    try {
      await fetch('/api/leagues/set-active', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ leagueId: id }),
      });
    } catch (err) {
      console.error('[LeaguePageHeader] Failed to persist active league', err);
    }
    
    // Reload page data for the new active league
    window.location.reload();
  };

  return (
    <div className="mb-6 flex items-center gap-4">
      <LeagueSwitcher />
      {leagues.length > 1 && (
        <LeagueHeaderControls
          leagues={leagues}
          activeId={activeId}
          isPro={isPro}
          onChange={handleChange}
        />
      )}
    </div>
  );
}

