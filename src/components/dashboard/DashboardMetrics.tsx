'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

function MetricCard({ label, value, change, icon, isLoading }: MetricCardProps) {
  const trendIcon = change ? (
    change > 0 ? (
      <TrendingUp className="h-4 w-4 text-venom-400" />
    ) : change < 0 ? (
      <TrendingDown className="h-4 w-4 text-alert-500" />
    ) : (
      <Minus className="h-4 w-4 text-gray-400" />
    )
  ) : null;

  return (
    <Card variant="dashboard">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-400">{label}</p>
            {isLoading ? (
              <div className="h-8 w-20 bg-field-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-100">{value}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-1">
            {icon && <div className="p-2 rounded-lg bg-venom-500/10">{icon}</div>}
            {change !== undefined && !isLoading && (
              <div className="flex items-center space-x-1 text-sm">
                {trendIcon}
                <span
                  className={
                    change > 0 ? 'text-venom-400' : change < 0 ? 'text-alert-500' : 'text-gray-400'
                  }
                >
                  {change > 0 ? '+' : ''}
                  {change}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TeamStats {
  record?: string; // e.g., "7-3"
  avgPoints?: number;
  powerRank?: number;
}

interface DashboardMetricsProps {
  teamKey?: string | null;
  leagueKey?: string | null;
}

export function DashboardMetrics({ teamKey, leagueKey }: DashboardMetricsProps) {
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when team changes
    setStats(null);
    setIsLoading(true);
    setError(null);

    if (!teamKey || !leagueKey) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

        // Fetch standings for the league to get team stats
        const res = await fetch(`${API_BASE}/yahoo/leagues/${leagueKey}/standings?format=json`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch standings');
        }

        const data = await res.json();

        // Find the current team in standings
        const standings = data?.standings || [];
        const teamStanding = standings.find((t: { team_key?: string }) => t.team_key === teamKey);

        if (teamStanding) {
          // Extract record, points, rank from standings format
          const wins = teamStanding.outcome_totals?.wins || 0;
          const losses = teamStanding.outcome_totals?.losses || 0;
          const ties = teamStanding.outcome_totals?.ties || 0;
          const pointsFor = parseFloat(teamStanding.points_for || '0');
          const rank = teamStanding.rank || null;
          const totalGames = wins + losses + ties || 1;

          setStats({
            record: `${wins}-${losses}${ties > 0 ? `-${ties}` : ''}`,
            avgPoints: totalGames > 0 ? Math.round((pointsFor / totalGames) * 10) / 10 : 0,
            powerRank: rank,
          });
        } else {
          // No data found - that's okay, just don't show placeholder
          setStats(null);
        }
      } catch (err) {
        console.error('[DashboardMetrics] Failed to fetch team stats:', err);
        setError('Unable to load team stats');
        // Don't show placeholder data on error
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [teamKey, leagueKey]);

  // Listen for team selection changes
  useEffect(() => {
    const handleTeamSelected = () => {
      // Trigger a refetch when team changes
      if (teamKey) {
        setStats(null);
        setIsLoading(true);
        // The effect above will refetch
      }
    };

    window.addEventListener('team-selected', handleTeamSelected);
    return () => window.removeEventListener('team-selected', handleTeamSelected);
  }, [teamKey]);

  // Don't show placeholder data - only show if we have real data
  if (!teamKey || (!isLoading && !stats && !error)) {
    return null; // Hide component if no team selected or no data available
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Team Overview</h2>
        <div className="text-sm text-gray-400">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">Team Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats?.record && (
          <MetricCard label="Your Record" value={stats.record} isLoading={isLoading} />
        )}
        {stats?.avgPoints !== undefined && (
          <MetricCard label="Avg Points" value={stats.avgPoints.toFixed(1)} isLoading={isLoading} />
        )}
        {stats?.powerRank && (
          <MetricCard label="Power Rank" value={`#${stats.powerRank}`} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
