// Matchup page - head-to-head comparison
'use client';

import { useSession } from 'next-auth/react';
import { useUserStore } from '@/lib/store';
import { useMatchup } from '@/hooks/use-matchup';
import { PlayerCard } from '@/components/PlayerCard';
import { TrustSnapshot } from '@/components/TrustSnapshot';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';

function MatchupContent() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { activeLeague, selectedWeek } = useUserStore();
  const { data: matchupData, isLoading, error } = useMatchup(activeLeague, selectedWeek);

  if (!session) {
    return (
      <Alert>
        <AlertDescription>Please sign in with Yahoo to view matchups.</AlertDescription>
      </Alert>
    );
  }

  if (!activeLeague) {
    return (
      <Alert>
        <AlertDescription>Please select a league to view matchups.</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !matchupData) {
    return (
      <Alert variant="danger">
        <AlertDescription>Failed to load matchup data. Please try again.</AlertDescription>
      </Alert>
    );
  }

  const { your_team, opponent_team, win_probability } = matchupData.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Matchup</h1>
        {win_probability !== undefined && (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-500">{win_probability.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Win Probability</div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Your Team */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{your_team.team_name}</h2>
            <div className="text-right">
              <div className="text-2xl font-bold">{your_team.total_projected.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Projected</div>
            </div>
          </div>
          <div className="space-y-2">
            {your_team.roster.map((player) => (
              <PlayerCard
                key={player.player_id}
                player={{
                  name: player.name,
                  team: player.team,
                  position: player.position,
                  opponent: null,
                  projection: {
                    // Architecture Law #3: Use API-provided values only, no calculations
                    // API returns single projected_points value - use as median
                    // Floor/ceiling unavailable from this endpoint - API should be enhanced
                    floor: player.projected_points, // TODO: API should provide projected_points.floor
                    median: player.projected_points,
                    ceiling: player.projected_points, // TODO: API should provide projected_points.ceiling
                  },
                  chips: [],
                  confidence: 0.7,
                }}
                mode="compact"
              />
            ))}
          </div>
        </div>

        {/* Opponent Team */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{opponent_team.team_name}</h2>
            <div className="text-right">
              <div className="text-2xl font-bold">{opponent_team.total_projected.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Projected</div>
            </div>
          </div>
          <div className="space-y-2">
            {opponent_team.roster.map((player) => (
              <PlayerCard
                key={player.player_id}
                player={{
                  name: player.name,
                  team: player.team,
                  position: player.position,
                  opponent: null,
                  projection: {
                    // Architecture Law #3: Use API-provided values only, no calculations
                    // API returns single projected_points value - use as median
                    // Floor/ceiling unavailable from this endpoint - API should be enhanced
                    floor: player.projected_points, // TODO: API should provide projected_points.floor
                    median: player.projected_points,
                    ceiling: player.projected_points, // TODO: API should provide projected_points.ceiling
                  },
                  chips: [],
                  confidence: 0.7,
                }}
                mode="compact"
              />
            ))}
          </div>
        </div>
      </div>

      {matchupData && <TrustSnapshot trust={matchupData.trust} />}
    </div>
  );
}

export default function MatchupPage() {
  return (
    <ToolErrorBoundary toolName="Matchup">
      <MatchupContent />
    </ToolErrorBoundary>
  );
}
