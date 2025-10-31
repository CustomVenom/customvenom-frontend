'use client';

import { useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';

interface YahooLeague {
  league_key: string;
  name: string;
  season: string;
  num_teams: number;
}

interface YahooTeam {
  team_key: string;
  name: string;
  team_logos?: Array<{ url: string }>;
}

interface YahooPlayer {
  player_key: string;
  name: {
    full: string;
  };
  display_position: string;
  editorial_team_abbr: string;
}

export function useYahooApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchYahooUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/yahoo/me`, {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Not authenticated');
        }
        throw new Error(`Failed to fetch user: ${res.status}`);
      }
      return await res.json();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeagues = useCallback(async (): Promise<YahooLeague[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/yahoo/leagues`, {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Not authenticated');
        }
        throw new Error(`Failed to fetch leagues: ${res.status}`);
      }
      const data = await res.json();
      return data.leagues || [];
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeams = useCallback(async (leagueKey: string): Promise<YahooTeam[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/yahoo/leagues/${leagueKey}/teams`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch teams: ${res.status}`);
      }
      const data = await res.json();
      return data.teams || [];
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoster = useCallback(async (teamKey: string): Promise<YahooPlayer[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/yahoo/team/${teamKey}/roster`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch roster: ${res.status}`);
      }
      const data = await res.json();
      return data.roster || [];
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchYahooUser,
    fetchLeagues,
    fetchTeams,
    fetchRoster,
  };
}
