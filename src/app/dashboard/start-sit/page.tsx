'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import ActionBar from '@/components/ActionBar';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import PlayerDrawer from '@/components/PlayerDrawer';
import PlayerSearch from '@/components/PlayerSearch';
import { useToast } from '@/components/Toast';
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';
import { ToolPageHeader } from '@/components/ToolPageHeader';
import { GlossaryTip } from '@/components/ui/GlossaryTip';
import { Breadcrumb } from '@/components/Breadcrumb';
import { LeagueContextHeader } from '@/components/LeagueContextHeader';
import { useLeagueContext } from '@/hooks/useLeagueContext';
import { trackFeatureInteraction, trackRiskModeChange, trackToolUsage } from '@/lib/analytics';
import { startSitSummary } from '@/lib/summary';
import { mapApiProjectionToRow, type Row } from '@/lib/tools';
import { ConnectionGuard, useIsConnected } from '@/components/ConnectionGuard';
import { useProjections } from '@/hooks/use-projections';
import { useUserStore } from '@/lib/store';
import { getCurrentWeek } from '@/lib/utils';
import { PlayerCard } from '@/components/PlayerCard';
import { TrustSnapshot } from '@/components/TrustSnapshot';

function StartSitContent() {
  const leagueContext = useLeagueContext();
  const isConnected = useIsConnected(leagueContext);
  const searchParams = useSearchParams();
  const { riskTolerance, setRiskTolerance, selectedWeek } = useUserStore();

  // Pre-fill from URL params
  const [playerA, setPlayerA] = useState(searchParams.get('playerA') || '');
  const [playerB, setPlayerB] = useState(searchParams.get('playerB') || '');
  const [risk, setRisk] = useState<'protect' | 'neutral' | 'chase'>(
    (searchParams.get('risk') as 'protect' | 'neutral' | 'chase') || riskTolerance || 'neutral',
  );
  const [result, setResult] = useState<{
    winner: 'A' | 'B';
    rowA: Row;
    rowB: Row;
    recommendation: string;
    confidence?: number;
    reasoning?: string;
    risk_adjusted?: number;
  } | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRow, setDrawerRow] = useState<Row | null>(null);

  const { setMsg, Toast } = useToast();

  // Use new useProjections hook
  const { data: projectionsData } = useProjections();

  // Convert projections to Row format for PlayerSearch compatibility
  const suggestions = useMemo(() => {
    if (!projectionsData?.data) return [];
    return projectionsData.data.projections.map((proj) => {
      const normalizedProjection = {
        ...proj,
        schema_version: 'v2.1' as const,
      };
      return mapApiProjectionToRow(
        normalizedProjection as Parameters<typeof mapApiProjectionToRow>[0],
        'v2.1',
        projectionsData.data.last_refresh,
      );
    });
  }, [projectionsData]);

  useEffect(() => {
    // Track tool view
    trackToolUsage('Start/Sit', { action: 'viewed' });
  }, []);

  // Track risk mode changes and sync with Zustand store
  useEffect(() => {
    const previousRisk = risk;
    setRiskTolerance(risk);
    return () => {
      if (previousRisk !== risk) {
        trackRiskModeChange(risk);
      }
    };
  }, [risk, setRiskTolerance]);

  async function handleCompare() {
    // Track comparison
    trackToolUsage('Start/Sit', {
      action: 'compare',
      playerA: playerA || '',
      playerB: playerB || '',
      risk,
    });

    // Find players in suggestions
    const rowA = suggestions.find(
      (r) =>
        r.player_name?.toLowerCase() === playerA.toLowerCase() ||
        r.player_id.toLowerCase() === playerA.toLowerCase(),
    );
    const rowB = suggestions.find(
      (r) =>
        r.player_name?.toLowerCase() === playerB.toLowerCase() ||
        r.player_id.toLowerCase() === playerB.toLowerCase(),
    );

    if (!rowA || !rowB) {
      setMsg('One or both players not found. Please search and select players.');
      return;
    }

    // Determine winner based on risk mode
    let winner: 'A' | 'B';
    let recommendation: string;
    let confidence: number;
    let reasoning: string;
    let riskAdjusted: number;

    if (risk === 'protect') {
      // Protect mode: prefer higher floor
      const floorDiff = rowA.range.p10 - rowB.range.p10;
      winner = floorDiff >= 0 ? 'A' : 'B';
      recommendation = winner === 'A' ? rowA.player_name : rowB.player_name;
      confidence = Math.min((rowA.confidence || 0.5) + (rowB.confidence || 0.5), 1.0) / 2;
      reasoning = `In Protect mode, ${recommendation} has a higher floor (${winner === 'A' ? rowA.range.p10 : rowB.range.p10} vs ${winner === 'A' ? rowB.range.p10 : rowA.range.p10}), providing more reliable production.`;
      riskAdjusted = Math.max(confidence - 0.1, 0.5);
    } else if (risk === 'chase') {
      // Chase mode: prefer higher ceiling
      const ceilingDiff = rowA.range.p90 - rowB.range.p90;
      winner = ceilingDiff >= 0 ? 'A' : 'B';
      recommendation = winner === 'A' ? rowA.player_name : rowB.player_name;
      confidence = Math.min((rowA.confidence || 0.5) + (rowB.confidence || 0.5), 1.0) / 2;
      reasoning = `In Chase mode, ${recommendation} has a higher ceiling (${winner === 'A' ? rowA.range.p90 : rowB.range.p90} vs ${winner === 'A' ? rowB.range.p90 : rowA.range.p90}), offering more upside potential.`;
      riskAdjusted = Math.min(confidence + 0.1, 0.95);
    } else {
      // Neutral mode: prefer higher median
      const medianDiff = rowA.range.p50 - rowB.range.p50;
      winner = medianDiff >= 0 ? 'A' : 'B';
      recommendation = winner === 'A' ? rowA.player_name : rowB.player_name;
      confidence = Math.min((rowA.confidence || 0.5) + (rowB.confidence || 0.5), 1.0) / 2;
      reasoning = `${recommendation} has a higher median projection (${winner === 'A' ? rowA.range.p50 : rowB.range.p50} vs ${winner === 'A' ? rowB.range.p50 : rowA.range.p50}), making them the safer choice.`;
      riskAdjusted = confidence;
    }

    // Log decision for debugging
    const decisionData = {
      playerA: {
        id: rowA.player_id,
        name: rowA.player_name,
      },
      playerB: {
        id: rowB.player_id,
        name: rowB.player_name,
      },
      chosen: winner === 'A' ? rowA.player_name : rowB.player_name,
      risk,
      timestamp: new Date().toISOString(),
      week: selectedWeek || getCurrentWeek(),
    };

    // POST to bubble registry API
    try {
      const response = await fetch('/api/decisions/bubble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision_id: crypto.randomUUID(),
          time: decisionData.timestamp,
          playerA: decisionData.playerA,
          playerB: decisionData.playerB,
          chosen: decisionData.chosen,
          risk: decisionData.risk,
          pre_game: true,
          week: decisionData.week,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log decision');
      }

      // Log to console as backup
      console.log('[DECISION]', decisionData);
    } catch (error) {
      // Fallback to console only
      console.log('[DECISION]', decisionData);
      console.warn('[DECISION] Failed to log to API', error);
    }

    // Add to Sentry breadcrumbs if available
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      try {
        const Sentry = (window as { Sentry?: { addBreadcrumb: (breadcrumb: unknown) => void } })
          .Sentry;
        if (Sentry) {
          Sentry.addBreadcrumb({
            category: 'decision',
            message: `Chose ${decisionData.chosen} over ${winner === 'A' ? rowB.player_name : rowA.player_name}`,
            level: 'info',
            data: decisionData,
          });
        }
      } catch {
        // Ignore Sentry errors
      }
    }

    setResult({
      winner,
      rowA,
      rowB,
      recommendation,
      confidence,
      reasoning,
      risk_adjusted: riskAdjusted,
    });
  }

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter' && playerA && playerB) {
        trackFeatureInteraction('keyboard_shortcut', 'enter_compare', { tool: 'Start/Sit' });
        handleCompare();
      } else if (e.key === '1') {
        trackFeatureInteraction('keyboard_shortcut', 'risk_protect', { tool: 'Start/Sit' });
        setRisk('protect');
      } else if (e.key === '2') {
        trackFeatureInteraction('keyboard_shortcut', 'risk_neutral', { tool: 'Start/Sit' });
        setRisk('neutral');
      } else if (e.key === '3') {
        trackFeatureInteraction('keyboard_shortcut', 'risk_chase', { tool: 'Start/Sit' });
        setRisk('chase');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playerA, playerB]); // eslint-disable-line react-hooks/exhaustive-deps

  function openDrawer(row: Row) {
    setDrawerRow(row);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerRow(null);
  }

  function handleExample() {
    trackFeatureInteraction('example', 'loaded', { tool: 'Start/Sit' });
    setPlayerA('Patrick Mahomes');
    setPlayerB('Jalen Hurts');
    setRisk('neutral');
  }

  return (
    <ConnectionGuard isConnected={isConnected}>
      <main className="container section space-y-4">
        <Breadcrumb items={[{ label: 'Start/Sit', href: '/dashboard/start-sit' }]} />

        {!leagueContext.isLoading && (
          <LeagueContextHeader
            leagueName={leagueContext.leagueName}
            teamName={leagueContext.teamName}
            week={leagueContext.week}
            scoringType={leagueContext.scoringType}
          />
        )}

        <ToolPageHeader title="Start / Sit Tieâ€”Breaker" currentTool="start-sit" />
        <p className="text-sm text-muted mb-4">
          <GlossaryTip term="range band" /> Â· <GlossaryTip term="driver chip" /> Â·{' '}
          <GlossaryTip term="risk modes" />
        </p>

        {!result ? (
          <EmptyState title="Compare two players" onExample={handleExample}>
            Enter player names to see Start/Sit recommendation with ranges and reason chips.
          </EmptyState>
        ) : null}

        <div className="rounded-lg p-6 bg-[rgb(var(--bg-card))] space-y-4 border border-[rgba(148,163,184,0.1)]">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[rgb(var(--text-secondary))]">
                Player A
              </label>
              <PlayerSearch
                rows={suggestions}
                placeholder="Search Player Aâ€¦"
                onSelect={(row) => setPlayerA(row.player_name || '')}
                className="mb-2"
              />
              <input
                type="text"
                value={playerA}
                onChange={(e) => setPlayerA(e.target.value)}
                placeholder="Or type manually"
                className="w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[rgb(var(--text-secondary))]">
                Player B
              </label>
              <PlayerSearch
                rows={suggestions}
                placeholder="Search Player Bâ€¦"
                onSelect={(row) => setPlayerB(row.player_name || '')}
                className="mb-2"
              />
              <input
                type="text"
                value={playerB}
                onChange={(e) => setPlayerB(e.target.value)}
                placeholder="Or type manually"
                className="w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Risk Mode
            </label>
            <div className="flex gap-2">
              {(['protect', 'neutral', 'chase'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  className={`risk-segment px-4 py-2 rounded-lg text-sm font-semibold ${
                    risk === r
                      ? 'selected bg-[rgb(var(--cv-primary))] text-[#0A0E1A] shadow-lg shadow-[rgba(16,185,129,0.3)]'
                      : 'bg-[rgba(16,185,129,0.1)] text-[rgb(var(--cv-primary))] border border-[rgba(16,185,129,0.3)]'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-[rgb(var(--text-dim))] mt-2">
              Keyboard shortcuts: 1/2/3 to select risk mode, Enter to compare
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleCompare}
            disabled={!playerA || !playerB}
            className="w-full"
          >
            Compare Players
          </Button>
        </div>

        {result && (
          <div className="border border-brand-primary dark:border-brand-accent rounded-lg p-6 bg-brand-primary/5 dark:bg-brand-accent/10">
            <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
              Recommendation
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{result.recommendation}</p>

            <div className="mt-3 flex items-center gap-2">
              <button
                className="cv-btn-ghost"
                onClick={() => {
                  const s = startSitSummary(
                    result.rowA,
                    result.rowB,
                    risk,
                    result.winner === 'A'
                      ? result.rowA.player_name || ''
                      : result.rowB.player_name || '',
                  );
                  navigator.clipboard.writeText(s);
                  setMsg('Summary copied');
                }}
              >
                Copy summary
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <PlayerCard
                player={{
                  name: result.rowA.player_name || '',
                  team: result.rowA.team || '',
                  position: result.rowA.position || '',
                  opponent: null, // Row type doesn't have opponent
                  projection: {
                    floor: result.rowA.range.p10,
                    median: result.rowA.range.p50,
                    ceiling: result.rowA.range.p90,
                  },
                  chips: result.rowA.explanations || [],
                  confidence: result.rowA.confidence || 0.7,
                }}
                mode="comparison"
                onDetails={() => openDrawer(result.rowA)}
              />

              <PlayerCard
                player={{
                  name: result.rowB.player_name || '',
                  team: result.rowB.team || '',
                  position: result.rowB.position || '',
                  opponent: null, // Row type doesn't have opponent
                  projection: {
                    floor: result.rowB.range.p10,
                    median: result.rowB.range.p50,
                    ceiling: result.rowB.range.p90,
                  },
                  chips: result.rowB.explanations || [],
                  confidence: result.rowB.confidence || 0.7,
                }}
                mode="comparison"
                onDetails={() => openDrawer(result.rowB)}
              />
            </div>
          </div>
        )}

        <ActionBar />
        <PlayerDrawer open={drawerOpen} onClose={closeDrawer} row={drawerRow} />
        {projectionsData && <TrustSnapshot trust={projectionsData.trust} />}
        <Toast />
      </main>
    </ConnectionGuard>
  );
}

export default function StartSitPage() {
  return (
    <ToolErrorBoundary toolName="Start/Sit">
      <StartSitContent />
    </ToolErrorBoundary>
  );
}
