'use client';
import { useLayoutEffect, useState } from 'react';

export function useSelectedLeague() {
  const [league, setLeague] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const url = new URL(window.location.href);
    const q = url.searchParams.get('league');
    const saved = localStorage.getItem('cv:selectedLeague');
    return q || saved;
  });

  useLayoutEffect(() => {
    if (!league) return;
    const url = new URL(window.location.href);
    const q = url.searchParams.get('league');
    if (!q) {
      url.searchParams.set('league', league);
      window.history.replaceState({}, '', url.toString());
    }
    localStorage.setItem('cv:selectedLeague', league);
  }, [league]);

  const save = (v: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('league', v);
    window.history.replaceState({}, '', url.toString());
    localStorage.setItem('cv:selectedLeague', v);
    setLeague(v);
  };

  return { league, setLeague: save };
}
