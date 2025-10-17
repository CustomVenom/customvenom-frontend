'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import ToolsTabs from '@/components/ToolsTabs';
import PlayerDrawer from '@/components/PlayerDrawer';
import EmptyState from '@/components/EmptyState';
import ActionBar from '@/components/ActionBar';
import { type Row } from '@/lib/tools';

export default function DecisionsPage() {
  const [risk, setRisk] = useState<'protect' | 'neutral' | 'chase'>('neutral');
  const [decisions, setDecisions] = useState<Array<{
    row: Row;
    action: string;
    why: string;
    next_step: string;
  }>>([]);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRow, setDrawerRow] = useState<Row | null>(null);

  function openDrawer(row: Row) {
    setDrawerRow(row);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerRow(null);
  }

  useEffect(() => {
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
          explanations: [
            { component: 'Target share ↑', delta_points: 0.028, confidence: 0.78 },
          ],
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
          explanations: [
            { component: 'Usage stable', delta_points: 0.012, confidence: 0.71 },
          ],
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
          explanations: [
            { component: 'QB downgrade', delta_points: -0.015, confidence: 0.69 },
          ],
          schema_version: 'v1',
          last_refresh: new Date().toISOString(),
        },
        action: 'Consider trading',
        why: 'QB situation limits upside',
        next_step: 'Target teams needing WR depth',
      },
    ];

    setDecisions(mockDecisions);
  }, [risk]);

  if (decisions.length === 0) {
    return (
      <main className="container section space-y-4">
        <h1 className="h1">Important Decisions</h1>
        <ToolsTabs />
        
        <EmptyState title="No decisions yet">
          Try switching your risk mode or refresh projections to see personalized recommendations.
        </EmptyState>
        
        <ActionBar />
      </main>
    );
  }

  return (
    <main className="container section space-y-4">
      <h1 className="h1">Important Decisions</h1>
      <ToolsTabs />

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Risk Profile
        </label>
        <div className="flex gap-2">
          {(['protect', 'neutral', 'chase'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRisk(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                risk === r
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {decisions.map((d, i) => (
          <div 
            key={i} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg">
                <button
                  className="text-brand-primary dark:text-brand-accent underline hover:no-underline"
                  onClick={() => openDrawer(d.row)}
                  aria-label={`Open ${d.row.player_name} details`}
                >
                  {d.row.player_name}
                </button>
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                #{i + 1}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Action:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">{d.action}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Why:</span>{' '}
                <span className="text-gray-700 dark:text-gray-300">{d.why}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Next step:</span>{' '}
                <span className="text-gray-700 dark:text-gray-300">{d.next_step}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-3 text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {d.row.team} · {d.row.position}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                · Median: {d.row.range.p50.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <ActionBar />
      <PlayerDrawer open={drawerOpen} onClose={closeDrawer} row={drawerRow} />
    </main>
  );
}

