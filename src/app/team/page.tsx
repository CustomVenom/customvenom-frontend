// My Team page - displays roster with projections enriched
'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/lib/store';
import { useRoster } from '@/hooks/use-roster';
import { useProjections } from '@/hooks/use-projections';
import { PlayerCard } from '@/components/PlayerCard';
import { TrustSnapshot } from '@/components/TrustSnapshot';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';
import type { Reason } from '@/lib/types';
import type { RosterPlayer } from '@/types/roster';
import type { PlayerProjection } from '@/types/players';

function MyTeamContent() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { activeLeague } = useUserStore();
  const {
    data: rosterData,
    isLoading: rosterLoading,
    error: rosterError,
  } = useRoster(activeLeague);
  const { data: projectionsData, isLoading: projectionsLoading } = useProjections();

  // Enrich roster with projections
  const enrichedRoster = useMemo(() => {
    if (!rosterData?.data || !projectionsData?.data) return null;

    const projections = projectionsData.data.projections;
    const roster = rosterData.data;

    // Map roster players to projections
    const enriched = [...(roster.starters || []), ...(roster.bench || [])].map((player: RosterPlayer) => {
      const projection = projections.find(
        (p: PlayerProjection) => p.player_id === player.player_id || p.player_id === (player as unknown as { nflverse_id?: string }).nflverse_id,
      );

      return {
        ...player,
        projection: projection
          ? {
              floor: projection.floor || projection.projected_points?.floor || 0,
              median: projection.median || projection.projected_points?.median || 0,
              ceiling: projection.ceiling || projection.projected_points?.ceiling || 0,
            }
          : { floor: 0, median: 0, ceiling: 0 },
        chips: projection?.reasons
          ? projection.reasons.map((r: string) => ({
              component: r,
              delta_points: 0,
              confidence: 0.7,
              unit: 'points' as const,
            }))
          : ([] as Reason[]),
        confidence: projection?.confidence || 0,
      };
    });

    return enriched;
  }, [rosterData, projectionsData]);

  const starters = enrichedRoster?.filter((p) => !(p as unknown as { is_bench?: boolean }).is_bench);
  const bench = enrichedRoster?.filter((p) => (p as unknown as { is_bench?: boolean }).is_bench);

  const totalProjected = starters?.reduce(
    (sum: number, p) => sum + ((p as { projection?: { median?: number } }).projection?.median || 0),
    0,
  );

  if (!session) {
    return (
      <Alert>
        <AlertDescription>Please sign in with Yahoo to view your team.</AlertDescription>
      </Alert>
    );
  }

  if (!activeLeague) {
    return (
      <Alert>
        <AlertDescription>Please select a league to view your team.</AlertDescription>
      </Alert>
    );
  }

  if (rosterLoading || projectionsLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (rosterError) {
    return (
      <Alert variant="danger">
        <AlertDescription>Failed to load roster. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Team</h1>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-500">{totalProjected?.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Projected Points</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Starters</h2>
        {starters && starters.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {starters.map((player) => (
              <PlayerCard
                key={player.player_id}
                player={{
                  name: player.name || player.name?.full || 'Unknown',
                  team: player.team || player.editorial_team_abbr || '',
                  position: player.position || player.display_position || '',
                  opponent: player.opponent || null,
                  projection: player.projection,
                  chips: player.chips || [],
                  confidence: player.confidence || 0,
                }}
                onDetails={() => console.log('View details:', player.player_id)}
                onTrade={() => console.log('Trade:', player.player_id)}
              />
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>No starters found in your roster.</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Bench</h2>
        {bench && bench.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {bench.map((player) => (
              <PlayerCard
                key={player.player_id}
                player={{
                  name: player.name || player.name?.full || 'Unknown',
                  team: player.team || player.editorial_team_abbr || '',
                  position: player.position || player.display_position || '',
                  opponent: player.opponent || null,
                  projection: player.projection,
                  chips: player.chips || [],
                  confidence: player.confidence || 0,
                }}
                mode="compact"
              />
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>No bench players found in your roster.</AlertDescription>
          </Alert>
        )}
      </div>

      {projectionsData && <TrustSnapshot trust={projectionsData.trust} />}
    </div>
  );
}

export default function MyTeamPage() {
  return (
    <ToolErrorBoundary toolName="My Team">
      <MyTeamContent />
    </ToolErrorBoundary>
  );
}
