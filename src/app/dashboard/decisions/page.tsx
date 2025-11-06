'use client';

import { useState, useEffect, useMemo } from 'react';

import ActionBar from '@/components/ActionBar';
import EmptyState from '@/components/EmptyState';
import PlayerDrawer from '@/components/PlayerDrawer';
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';
import { ToolPageHeader } from '@/components/ToolPageHeader';
import { GlossaryTip } from '@/components/ui/GlossaryTip';
import { Breadcrumb } from '@/components/Breadcrumb';
import { LeagueContextHeader } from '@/components/LeagueContextHeader';
import { useLeagueContext } from '@/hooks/useLeagueContext';
import { trackToolUsage, trackRiskModeChange, trackFeatureInteraction } from '@/lib/analytics';
import { type Row } from '@/lib/tools';
import { ConnectionGuard, useIsConnected } from '@/components/ConnectionGuard';

function DecisionsContent() {
  const leagueContext = useLeagueContext();
  const isConnected = useIsConnected(leagueContext);
  const [risk, setRisk] = useState<'protect' | 'neutral' | 'chase'>('neutral');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRow, setDrawerRow] = useState<Row | null>(null);

  function openDrawer(row: Row) {
    trackFeatureInteraction('player_drawer', 'opened', {
      tool: 'Decisions',
      player: row.player_name || '',
    });
    setDrawerRow(row);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerRow(null);
  }

  // Track tool view
  useEffect(() => {
    trackToolUsage('Decisions', { action: 'viewed' });
  }, []);

  // Track risk mode changes
  useEffect(() => {
    trackRiskModeChange(risk);
  }, [risk]);

  // Keyboard shortcuts for risk modes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '1') {
        trackFeatureInteraction('keyboard_shortcut', 'risk_protect', { tool: 'Decisions' });
        setRisk('protect');
      } else if (e.key === '2') {
        trackFeatureInteraction('keyboard_shortcut', 'risk_neutral', { tool: 'Decisions' });
        setRisk('neutral');
      } else if (e.key === '3') {
        trackFeatureInteraction('keyboard_shortcut', 'risk_chase', { tool: 'Decisions' });
        setRisk('chase');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const decisions = useMemo(() => {
    // TODO: Fetch from API based on risk profile
    // For now, show mock data
    const mockDecisions = [
      {
        row: {
          player_id: 'ceedee_lamb',
          player_name: 'CeeDee Lamb',
          team: 'DAL',
          position: 'WR',
          range: { p10: 12.5, p50: 16.8, p90: 21.3 },
          explanations: [{ component: 'Target share â†‘', delta_points: 0.028, confidence: 0.78 }],
          schema_version: 'v1',
          last_refresh: new Date().toISOString(),
        },
        action: 'Start with confidence',
        why: 'Target share trending up with favorable matchup',
        next_step: 'Monitor injury report Wednesday',
      },
      {
        row: {
          player_id: 'jahmyr_gibbs',
          player_name: 'Jahmyr Gibbs',
          team: 'DET',
          position: 'RB',
          range: { p10: 14.2, p50: 18.5, p90: 24.1 },
          explanations: [{ component: 'Usage stable', delta_points: 0.012, confidence: 0.71 }],
          schema_version: 'v1',
          last_refresh: new Date().toISOString(),
        },
        action: 'Priority waiver add',
        why: 'High floor with rushing upside',
        next_step: 'Bid $20-25 FAAB',
      },
      {
        row: {
          player_id: 'garrett_wilson',
          player_name: 'Garrett Wilson',
          team: 'NYJ',
          position: 'WR',
          range: { p10: 10.8, p50: 14.2, p90: 18.9 },
          explanations: [{ component: 'QB downgrade', delta_points: -0.015, confidence: 0.69 }],
          schema_version: 'v1',
          last_refresh: new Date().toISOString(),
        },
        action: 'Consider trading',
        why: 'QB situation limits upside',
        next_step: 'Target teams needing WR depth',
      },
    ];

    return mockDecisions;
  }, []);

  return (
    <ConnectionGuard isConnected={isConnected}>
      {decisions.length === 0 ? (
        <main className="container section space-y-4">
          <Breadcrumb items={[{ label: 'Decisions', href: '/dashboard/decisions' }]} />

          {!leagueContext.isLoading && (
            <LeagueContextHeader
              leagueName={leagueContext.leagueName}
              teamName={leagueContext.teamName}
              week={leagueContext.week}
              scoringType={leagueContext.scoringType}
            />
          )}

          <ToolPageHeader title="Decisions" currentTool="decisions" />

          <EmptyState title="No decisions yet">
            Try switching your risk mode or refresh projections to see personalized recommendations.
          </EmptyState>

          <ActionBar />
        </main>
      ) : (
        <main className="container section space-y-4">
          <Breadcrumb items={[{ label: 'Important Decisions', href: '/dashboard/decisions' }]} />

          {!leagueContext.isLoading && (
            <LeagueContextHeader
              leagueName={leagueContext.leagueName}
              teamName={leagueContext.teamName}
              week={leagueContext.week}
              scoringType={leagueContext.scoringType}
            />
          )}

          <ToolPageHeader title="Decisions" currentTool="decisions" />
          <p className="text-sm text-muted mb-4">
            <GlossaryTip term="driver chip" /> Â· <GlossaryTip term="coverage" />
          </p>

          <div>
            <label className="block text-sm font-medium mb-2 text-[rgb(var(--text-secondary))]">
              Risk Profile
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
              Keyboard shortcuts: 1/2/3 to select risk mode
            </p>
          </div>

          <div className="space-y-4">
            {decisions.map((d, i) => (
              <div
                key={i}
                className="player-row rounded-lg p-6 bg-[rgb(var(--bg-card))] border border-[rgba(148,163,184,0.1)]"
                onClick={() => openDrawer(d.row)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">
                    <span className="text-[rgb(var(--cv-primary))]">{d.row.player_name}</span>
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">#{i + 1}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-[rgb(var(--text-dim))]">Action:</span>{' '}
                    <span className="font-semibold text-[rgb(var(--text-primary))]">
                      {d.action}
                    </span>
                  </div>
                  <div>
                    <span className="text-[rgb(var(--text-dim))]">Why:</span>{' '}
                    <span className="text-[rgb(var(--text-secondary))]">{d.why}</span>
                  </div>
                  <div>
                    <span className="text-[rgb(var(--text-dim))]">Next step:</span>{' '}
                    <span className="text-[rgb(var(--text-secondary))]">{d.next_step}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {d.row.team} Â· {d.row.position}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Â· Median: {d.row.range.p50.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <ActionBar />
          <PlayerDrawer open={drawerOpen} onClose={closeDrawer} row={drawerRow} />
        </main>
      )}
    </ConnectionGuard>
  );
}

export default function DecisionsPage() {
  return (
    <ToolErrorBoundary toolName="Important Decisions">
      <DecisionsContent />
    </ToolErrorBoundary>
  );
}
