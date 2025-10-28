'use client';
import { useEffect, useState } from 'react';

export function useSelectedLeague() {
  const [league, setLeague] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('league');
    const saved = localStorage.getItem('cv:selectedLeague');
    const val = q || saved;

    if (val) {
      setLeague(val);
      if (!q) {
        url.searchParams.set('league', val);
        window.history.replaceState({}, '', url.toString());
      }
      localStorage.setItem('cv:selectedLeague', val);
    }
  }, []);

  const save = (v: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('league', v);
    window.history.replaceState({}, '', url.toString());
    localStorage.setItem('cv:selectedLeague', v);
    setLeague(v);
  };

  return { league, setLeague: save };
}
