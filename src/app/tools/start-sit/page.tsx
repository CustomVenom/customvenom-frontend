'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import ToolsTabs from '@/components/ToolsTabs';
import PlayerDrawer from '@/components/PlayerDrawer';
import PlayerSearch from '@/components/PlayerSearch';
import EmptyState from '@/components/EmptyState';
import ActionBar from '@/components/ActionBar';
import Button from '@/components/Button';
import { type Row, fetchProjections } from '@/lib/tools';

export default function StartSitPage() {
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');
  const [risk, setRisk] = useState<'protect' | 'neutral' | 'chase'>('neutral');
  const [result, setResult] = useState<{ 
    winner: 'A' | 'B'; 
    rowA: Row; 
    rowB: Row; 
    recommendation: string 
  } | null>(null);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRow, setDrawerRow] = useState<Row | null>(null);
  
  const [suggestions, setSuggestions] = useState<Row[]>([]);

  useEffect(() => { 
    fetchProjections().then(setSuggestions).catch(() => {}); 
  }, []);

  function openDrawer(row: Row) {
    setDrawerRow(row);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerRow(null);
  }

  function handleExample() {
    setPlayerA('Patrick Mahomes');
    setPlayerB('Jalen Hurts');
    setRisk('neutral');
  }

  async function handleCompare() {
    // TODO: Wire to API endpoint
    // For now, return mock data
    const mockRowA: Row = {
      player_id: playerA.toLowerCase().replace(/\s/g, '_'),
      player_name: playerA,
      team: 'KC',
      position: 'QB',
      range: { p10: 18.2, p50: 22.5, p90: 28.1 },
      explanations: [
        { component: 'Usage ↑', delta_points: 0.021, confidence: 0.72 },
        { component: 'Matchup OK', delta_points: -0.008, confidence: 0.68 },
      ],
      schema_version: 'v1',
      last_refresh: new Date().toISOString(),
    };

    const mockRowB: Row = {
      player_id: playerB.toLowerCase().replace(/\s/g, '_'),
      player_name: playerB,
      team: 'PHI',
      position: 'QB',
      range: { p10: 19.5, p50: 24.2, p90: 29.8 },
      explanations: [
        { component: 'Rushing upside', delta_points: 0.032, confidence: 0.75 },
      ],
      schema_version: 'v1',
      last_refresh: new Date().toISOString(),
    };

    setResult({
      winner: 'B',
      rowA: mockRowA,
      rowB: mockRowB,
      recommendation: `Start ${playerB} over ${playerA} — ${risk} mode favors the rushing upside.`,
    });
  }

  return (
    <main className="container section space-y-4">
      <h1 className="h1">Start / Sit Tie‑Breaker</h1>
      <ToolsTabs />

      {!result ? (
        <EmptyState 
          title="Compare two players"
          onExample={handleExample}
        >
          Enter player names to see Start/Sit recommendation with ranges and reason chips.
        </EmptyState>
      ) : null}

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Player A
            </label>
            <PlayerSearch
              rows={suggestions}
              placeholder="Search Player A…"
              onSelect={(row) => setPlayerA(row.player_name || '')}
              className="mb-2"
            />
            <input
              type="text"
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
              placeholder="Or type manually"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Player B
            </label>
            <PlayerSearch
              rows={suggestions}
              placeholder="Search Player B…"
              onSelect={(row) => setPlayerB(row.player_name || '')}
              className="mb-2"
            />
            <input
              type="text"
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
              placeholder="Or type manually"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Risk Mode
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press 1/2/3 to select risk mode
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <h4 className="font-semibold mb-2">
                <button
                  className="text-brand-primary dark:text-brand-accent underline hover:no-underline"
                  onClick={() => openDrawer(result.rowA)}
                  aria-label={`Open ${result.rowA.player_name} details`}
                >
                  {result.rowA.player_name}
                </button>
              </h4>
              <div className="text-sm space-y-1">
                <div>Floor: {result.rowA.range.p10.toFixed(1)}</div>
                <div>Median: {result.rowA.range.p50.toFixed(1)}</div>
                <div>Ceiling: {result.rowA.range.p90.toFixed(1)}</div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <h4 className="font-semibold mb-2">
                <button
                  className="text-brand-primary dark:text-brand-accent underline hover:no-underline"
                  onClick={() => openDrawer(result.rowB)}
                  aria-label={`Open ${result.rowB.player_name} details`}
                >
                  {result.rowB.player_name}
                </button>
              </h4>
              <div className="text-sm space-y-1">
                <div>Floor: {result.rowB.range.p10.toFixed(1)}</div>
                <div>Median: {result.rowB.range.p50.toFixed(1)}</div>
                <div>Ceiling: {result.rowB.range.p90.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ActionBar />
      <PlayerDrawer open={drawerOpen} onClose={closeDrawer} row={drawerRow} />
    </main>
  );
}

