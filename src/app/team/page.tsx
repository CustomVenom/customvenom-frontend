// My Team page - displays roster with projections enriched
'use client';

import { useSearchParams } from 'next/navigation';
import { useProjections } from '@customvenom/lib/hooks/useProjections';
import { useSession } from '@customvenom/lib/hooks/useSession';
import { useYahooRoster } from '@customvenom/lib/hooks/useYahooRoster';
import StarterGrid from '@/components/team/StarterGrid';
import BenchList from '@/components/team/BenchList';
import TeamTotal from '@/components/team/TeamTotal';
import OptimizerWidget from '@/components/team/OptimizerWidget';
import PlayerDrawer from '@/components/player/PlayerDrawer';
import { adaptProjections } from '@customvenom/lib/adapters/projections-adapter';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';

function MyTeamContent() {
  const params = useSearchParams();
  const sport: 'nfl' | 'nba' = 'nfl';
  const week = params.get('week') ?? '2025-11';
  const playerId = params.get('player') ?? undefined;

  const { session, loading: sLoading } = useSession();
  const { data: projData, isLoading: pLoading } = useProjections({ sport, week });
  const { data: rosterData, isLoading: rLoading } = useYahooRoster({ sport, session });

  if (sLoading || pLoading || rLoading) {
    return (
      <div className="table-scroll">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="table-scroll">
        <Alert>
          <AlertDescription>
            <h2>Connect Your Yahoo Account</h2>
            <p>View your roster and get personalized recommendations</p>
            <a href="/settings" className="btn-primary">
              Connect Yahoo
            </a>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!projData || !rosterData) {
    return (
      <div className="table-scroll">
        <Alert variant="danger">
          <AlertDescription>Failed to load team data. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Adapt projections to UI model
  const projections = adaptProjections({ projections: projData.projections });
  const byId = new Map(projections.map((p) => [p.playerId, p]));

  // Enrich roster with projections
  const roster = rosterData.roster;

  // Normalize roster players to typed structure
  type RosterPlayer = {
    player_id: string;
    name: string;
    selected_position?: string;
    [key: string]: unknown; // Allow other fields to pass through
  };

  const toRosterPlayer = (rp: Record<string, unknown>): RosterPlayer | null => {
    const pid =
      (typeof rp['player_id'] === 'string' && rp['player_id']) ||
      (typeof rp['playerId'] === 'string' && rp['playerId']) ||
      '';
    if (!pid) return null;

    let name = '';
    if (typeof rp['player_name'] === 'string') name = rp['player_name'];
    else if (typeof rp['name'] === 'string') name = rp['name'];
    else if (rp['name'] && typeof (rp['name'] as { full?: string }).full === 'string')
      name = (rp['name'] as { full: string }).full;
    if (!name) name = 'Unknown';

    const selected_position =
      (typeof rp['selected_position'] === 'string' && rp['selected_position']) ||
      (typeof rp['position'] === 'string' && rp['position']) ||
      undefined;

    return { player_id: pid, name, selected_position, ...rp };
  };

  const normalized: RosterPlayer[] = (roster?.players ?? [])
    .map((rp: Record<string, unknown>) => toRosterPlayer(rp))
    .filter((x): x is RosterPlayer => !!x);

  type EnrichedPlayer = RosterPlayer & {
    projection: { median: number } | null;
  };

  const enriched: EnrichedPlayer[] = normalized.map((p) => ({
    ...p,
    projection: byId.get(p.player_id) ?? null,
  }));

  const starters = enriched.filter((p) => p.selected_position && p.selected_position !== 'BN');
  const bench = enriched.filter((p) => p.selected_position === 'BN');
  const total = starters.reduce((sum: number, p) => sum + (p.projection?.median ?? 0), 0);

  return (
    <div className="table-scroll">
      <TeamTotal total={total} />
      <StarterGrid starters={starters} />
      <BenchList bench={bench} />
      <OptimizerWidget enriched={starters} teamKey={rosterData.leagueKey} riskProfile="neutral" />
      <PlayerDrawer playerId={playerId} projections={projections} />
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
