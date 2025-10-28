'use client';

import React, { useEffect, useState } from 'react';

import { LeagueHeaderControls } from './LeagueHeaderControls';
import { LeagueSwitcher } from './LeagueSwitcher';

import type { MeLeaguesResponse } from '@/types/leagues';

interface LeaguePageHeaderProps {
  isPro?: boolean;
}

interface LeagueData extends MeLeaguesResponse {
  defaultLeagueId?: string;
  lastSync?: string;
}

export function LeaguePageHeader({ isPro = false }: LeaguePageHeaderProps): React.JSX.Element {
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = process.env['NEXT_PUBLIC_API_BASE']!;
    fetch(`${api}/yahoo/leagues?format=json`, {
      credentials: 'include',
      headers: { accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setData(data as LeagueData);
        }
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

  const leagues = data.leagues.map((l) => ({
    id: l.key,
    name: l.name,
  }));

  const activeId = data.defaultLeagueId || localStorage.getItem('cv_last_league') || undefined;

  const handleChange = async (id: string): Promise<void> => {
    localStorage.setItem('cv_last_league', id);

    // Optionally POST to server (stub for now)
    // TODO: Implement set-active endpoint in Workers API if needed

    // Reload page data for the new active league
    window.location.reload();
  };

  return (
    <div className="mb-6 flex items-center gap-4">
      <LeagueSwitcher />
      {leagues.length > 1 && activeId && (
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
