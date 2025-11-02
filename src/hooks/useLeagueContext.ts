import { useState, useEffect } from 'react';

interface LeagueContext {
  leagueName: string;
  teamName: string;
  week: number;
  scoringType: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch league context data for LeagueContextHeader
 * Uses /api/roster endpoint which returns league context along with roster data
 */
export function useLeagueContext(): LeagueContext {
  const [context, setContext] = useState<LeagueContext>({
    leagueName: 'My League',
    teamName: 'My Team',
    week: 1,
    scoringType: 'Standard',
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const res = await fetch('/api/roster', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) {
          // If not connected or error, use defaults
          setContext((prev) => ({
            ...prev,
            isLoading: false,
            error: null, // Don't show error, just use defaults
          }));
          return;
        }

        const data = await res.json();

        // Extract week number from week string (format: "2025-01")
        const weekNumber = data.week
          ? parseInt(data.week.split('-')[1] || '1', 10)
          : data.current_week || 1;

        setContext({
          leagueName: data.league_name || 'My League',
          teamName: data.team_name || 'My Team',
          week: weekNumber,
          scoringType: data.scoring_type || 'Standard',
          isLoading: false,
          error: null,
        });
      } catch {
        // On error, use defaults (silent failure)
        setContext((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      }
    };

    fetchContext();
  }, []);

  return context;
}
