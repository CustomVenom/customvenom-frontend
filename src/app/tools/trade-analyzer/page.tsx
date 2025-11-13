// Trade Analyzer - Compare your players vs opponent players
'use client';

import { useState, useMemo } from 'react';
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

function TradeAnalyzerContent() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { activeLeague } = useUserStore();
  const { data: rosterData, isLoading: rosterLoading } = useRoster(activeLeague);
  const { data: projectionsData, isLoading: projectionsLoading } = useProjections();

  const [yourPlayers, setYourPlayers] = useState<string[]>([]);
  const [opponentPlayers, setOpponentPlayers] = useState<string[]>([]);

  // Enrich roster with projections
  const enrichedRoster = useMemo(() => {
    if (!rosterData?.data || !projectionsData?.data) return null;

    const projections = projectionsData.data.projections;
    const roster = rosterData.data;

    const allPlayers = [...(roster.starters || []), ...(roster.bench || [])];

    return allPlayers.map((player: RosterPlayer) => {
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
        chips: (projection?.reasons || []).map((r: string) => ({
          component: r,
          delta_points: 0,
          confidence: 0.7,
          unit: 'points' as const,
        })) as Reason[],
        confidence: projection?.confidence || 0,
      };
    });
  }, [rosterData, projectionsData]);

  // Calculate trade value
  const tradeAnalysis = useMemo(() => {
    if (!enrichedRoster || !projectionsData?.data) return null;

    const yourProjections = yourPlayers
      .map((id) => enrichedRoster.find((p) => p.player_id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    const opponentProjections = opponentPlayers
      .map((id) => projectionsData.data.projections.find((p) => p.player_id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    if (yourProjections.length === 0 || opponentProjections.length === 0) return null;

    const yourTotal = yourProjections.reduce(
      (sum: number, p) => sum + ((p as { projection?: { median?: number } }).projection?.median || 0),
      0,
    );
    const opponentTotal = opponentProjections.reduce(
      (sum: number, p) => sum + (p.median || (p as { projected_points?: { median?: number } }).projected_points?.median || 0),
      0,
    );

    const diff = yourTotal - opponentTotal;
    const fairTrade = Math.abs(diff) < 2; // Within 2 points is fair
    const recommendation = diff > 0 ? 'unfavorable' : diff < -2 ? 'favorable' : 'fair';

    return {
      yourTotal,
      opponentTotal,
      diff,
      fairTrade,
      recommendation,
    };
  }, [yourPlayers, opponentPlayers, enrichedRoster, projectionsData]);

  const toggleYourPlayer = (playerId: string) => {
    setYourPlayers((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId],
    );
  };

  const toggleOpponentPlayer = (playerId: string) => {
    setOpponentPlayers((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId],
    );
  };

  if (!session) {
    return (
      <Alert>
        <AlertDescription>Please sign in with Yahoo to use the Trade Analyzer.</AlertDescription>
      </Alert>
    );
  }

  if (!activeLeague) {
    return (
      <Alert>
        <AlertDescription>Please select a league to analyze trades.</AlertDescription>
      </Alert>
    );
  }

  if (rosterLoading || projectionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trade Analyzer</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Your Players */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Players</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {enrichedRoster?.map((player) => (
              <div
                key={player.player_id}
                className={`cursor-pointer border-2 rounded-lg p-2 transition-colors ${
                  yourPlayers.includes(player.player_id)
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleYourPlayer(player.player_id)}
              >
                <PlayerCard
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
              </div>
            ))}
          </div>
        </div>

        {/* Opponent Players */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Opponent Players</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {projectionsData?.data.projections.map((player) => (
              <div
                key={player.player_id}
                className={`cursor-pointer border-2 rounded-lg p-2 transition-colors ${
                  opponentPlayers.includes(player.player_id)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleOpponentPlayer(player.player_id)}
              >
                <PlayerCard
                  player={{
                    name: player.name || player.player_name || 'Unknown',
                    team: player.team || '',
                    position: player.position || '',
                    opponent: player.opponent || null,
                    projection: {
                      floor: player.floor || player.projected_points?.floor || 0,
                      median: player.median || player.projected_points?.median || 0,
                      ceiling: player.ceiling || player.projected_points?.ceiling || 0,
                    },
                    chips: (player.reasons || []).map((r: string) => ({
                      component: r,
                      delta_points: 0,
                      confidence: 0.7,
                      unit: 'points' as const,
                    })) as Reason[],
                    confidence: player.confidence || 0,
                  }}
                  mode="compact"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trade Analysis */}
      {tradeAnalysis && (
        <div className="border rounded-lg p-6 bg-card">
          <h3 className="text-xl font-semibold mb-4">Trade Analysis</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Your Total</div>
              <div className="text-2xl font-bold">{tradeAnalysis.yourTotal.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Opponent Total</div>
              <div className="text-2xl font-bold">{tradeAnalysis.opponentTotal.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Difference</div>
              <div
                className={`text-2xl font-bold ${
                  tradeAnalysis.diff > 0 ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {tradeAnalysis.diff > 0 ? '+' : ''}
                {tradeAnalysis.diff.toFixed(1)}
              </div>
            </div>
          </div>
          <div
            className={`p-4 rounded-lg ${
              tradeAnalysis.recommendation === 'favorable'
                ? 'bg-green-500/10 border border-green-500'
                : tradeAnalysis.recommendation === 'unfavorable'
                  ? 'bg-red-500/10 border border-red-500'
                  : 'bg-yellow-500/10 border border-yellow-500'
            }`}
          >
            <div className="font-semibold mb-2">
              Recommendation:{' '}
              {tradeAnalysis.recommendation === 'favorable'
                ? 'Favorable Trade'
                : tradeAnalysis.recommendation === 'unfavorable'
                  ? 'Unfavorable Trade'
                  : 'Fair Trade'}
            </div>
            <div className="text-sm text-muted-foreground">
              {tradeAnalysis.recommendation === 'favorable'
                ? 'This trade would improve your team based on projected points.'
                : tradeAnalysis.recommendation === 'unfavorable'
                  ? 'This trade would weaken your team based on projected points.'
                  : 'This trade is roughly even based on projected points.'}
            </div>
          </div>
        </div>
      )}

      {projectionsData && <TrustSnapshot trust={projectionsData.trust} />}
    </div>
  );
}

export default function TradeAnalyzerPage() {
  return (
    <ToolErrorBoundary toolName="Trade Analyzer">
      <TradeAnalyzerContent />
    </ToolErrorBoundary>
  );
}
