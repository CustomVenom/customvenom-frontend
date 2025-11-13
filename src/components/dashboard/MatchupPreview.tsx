'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

interface MatchupTeam {
  team_key: string;
  team_name: string;
  projected_points?: number;
}

interface MatchupResponse {
  ok: boolean;
  my_team?: MatchupTeam;
  opponent?: MatchupTeam;
  week?: number;
  request_id?: string;
}

export function MatchupPreview({
  teamKey,
  leagueKey,
}: {
  teamKey: string | null;
  leagueKey: string | null;
}) {
  const [matchup, setMatchup] = useState<MatchupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  useEffect(() => {
    if (!teamKey || !leagueKey) {
      setLoading(false);
      return;
    }

    const fetchMatchup = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${API_BASE}/yahoo/matchup?team_key=${encodeURIComponent(teamKey)}`,
          {
            credentials: 'include',
            cache: 'no-store',
          },
        );

        if (!res.ok) {
          // Handle specific error cases
          if (res.status === 401) {
            setError('Authentication required. Please reconnect your Yahoo account.');
          } else if (res.status === 502 || res.status === 503) {
            setError('Matchup service temporarily unavailable. Please try again later.');
          } else if (res.status === 404) {
            setError('Matchup data not available for this week.');
          } else {
            setError(`Unable to load matchup (${res.status})`);
          }
          setMatchup(null);
          return;
        }

        const data: MatchupResponse = await res.json();
        if (data.ok && data.my_team && data.opponent) {
          setMatchup(data);
        } else {
          setError('Matchup data incomplete');
          setMatchup(null);
        }
      } catch (err) {
        logger.error('[MatchupPreview] Error fetching matchup', {
          error: err instanceof Error ? err.message : String(err),
        });
        // Network errors or other exceptions
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('Network error. Please check your connection.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load matchup');
        }
        setMatchup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchup();
  }, [teamKey, leagueKey, API_BASE]);

  if (loading) {
    return (
      <div className="text-sm text-gray-400 animate-pulse">Loading matchup...</div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-amber-400 space-y-2">
        <div className="font-medium">Matchup unavailable</div>
        <div className="text-xs text-gray-500">{error}</div>
      </div>
    );
  }

  if (!matchup || !matchup.my_team || !matchup.opponent) {
    return (
      <div className="text-sm text-gray-400">
        No matchup data available for this week
      </div>
    );
  }

  const yourProjected = matchup.my_team.projected_points || 0;
  const oppProjected = matchup.opponent.projected_points || 0;
  const advantage = yourProjected - oppProjected;

  return (
    <div className="space-y-3">
      {/* Your Team */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">{matchup.my_team.team_name}</span>
        <span className="text-lg font-bold text-venom-400">{yourProjected.toFixed(1)}</span>
      </div>

      {/* VS */}
      <div className="text-center text-xs text-gray-500">vs</div>

      {/* Opponent */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">{matchup.opponent.team_name}</span>
        <span className="text-lg font-bold text-gray-300">{oppProjected.toFixed(1)}</span>
      </div>

      {/* Advantage */}
      <div className="mt-4 pt-3 border-t border-field-600">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Projected Advantage:</span>
          <span
            className={
              advantage > 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'
            }
          >
            {advantage > 0 ? '+' : ''}
            {advantage.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
