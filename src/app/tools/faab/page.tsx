'use client';

import { useState, useEffect } from 'react';

import ActionBar from '@/components/ActionBar';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';
import ToolsTabs from '@/components/ToolsTabs';
import { GlossaryTip } from '@/components/ui/GlossaryTip';
import { trackToolUsage, trackFeatureInteraction } from '@/lib/analytics';
import { faabSummary } from '@/lib/summary';

function FaabContent() {
  const [player, setPlayer] = useState('');
  const [budget, setBudget] = useState('100');
  const [result, setResult] = useState<{
    min: number;
    likely: number;
    max: number;
    reason: string;
  } | null>(null);

  const { setMsg, Toast } = useToast();

  // Track tool view
  useEffect(() => {
    trackToolUsage('FAAB', { action: 'viewed' });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter' && player && budget) {
        trackFeatureInteraction('keyboard_shortcut', 'enter_calculate', { tool: 'FAAB' });
        handleCalculate();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player, budget]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleExample() {
    trackFeatureInteraction('example', 'loaded', { tool: 'FAAB' });
    setPlayer('Jahmyr Gibbs');
    setBudget('100');
  }

  async function handleCalculate() {
    // Track calculation
    trackToolUsage('FAAB', {
      action: 'calculate',
      player: player || '',
      budget: parseInt(budget) || 0,
    });

    // TODO: Wire to API endpoint
    // For now, return mock data
    setResult({
      min: 15,
      likely: 22,
      max: 35,
      reason: 'High usage upside with favorable schedule',
    });
  }

  function copyBid(amount: number, label: 'Min' | 'Likely' | 'Max') {
    trackFeatureInteraction('copy_bid', label.toLowerCase(), { tool: 'FAAB', amount });
    navigator.clipboard.writeText(amount.toString());
    setMsg(`${label} bid copied`);
  }

  return (
    <main className="container section space-y-4">
      <h1 className="h1">
        FAAB Bid Helper <GlossaryTip term="faab band" />
      </h1>
      <ToolsTabs />

      {!result ? (
        <EmptyState title="Calculate FAAB bid range" onExample={handleExample}>
          Enter a player name and your remaining budget for smart bid recommendations.
        </EmptyState>
      ) : null}

      <div className="rounded-lg p-6 bg-[rgb(var(--bg-card))] space-y-4 border border-[rgba(148,163,184,0.1)]">
        <div>
          <label className="block text-sm font-medium mb-2 text-[rgb(var(--text-secondary))]">
            Player Name
          </label>
          <input
            type="text"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            placeholder="e.g., Jahmyr Gibbs"
            className="w-full px-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[rgb(var(--text-secondary))]">
            Remaining Budget ($)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="100"
            className="w-full px-3 py-2 rounded-lg"
          />
        </div>

        <Button
          variant="primary"
          onClick={handleCalculate}
          disabled={!player || !budget}
          className="w-full"
        >
          Calculate Bid Range
        </Button>
        <p className="text-xs text-[rgb(var(--text-dim))] text-center -mt-2">
          Keyboard shortcut: Press Enter to calculate
        </p>
      </div>

      {result && (
        <div className="border border-brand-primary dark:border-brand-accent rounded-lg p-6 bg-brand-primary/5 dark:bg-brand-accent/10">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
            Bid Recommendations for {player}
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg p-4 bg-[rgb(var(--bg-elevated))] border border-[rgba(148,163,184,0.15)]">
              <div className="text-xs text-[rgb(var(--text-dim))] mb-1 uppercase tracking-wide">
                Min
              </div>
              <div className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                ${result.min}
              </div>
              <button
                onClick={() => copyBid(result.min, 'Min')}
                className="text-xs text-brand-primary dark:text-brand-accent hover:underline"
              >
                Copy
              </button>
            </div>

            <div className="border border-brand-primary dark:border-brand-accent rounded-lg p-4 bg-brand-primary/10 dark:bg-brand-accent/20">
              <div className="text-xs text-[rgb(var(--text-dim))] mb-1 uppercase tracking-wide">
                Likely
              </div>
              <div className="text-2xl font-semibold text-brand-primary dark:text-brand-accent mb-2">
                ${result.likely}
              </div>
              <button
                onClick={() => copyBid(result.likely, 'Likely')}
                className="text-xs text-brand-primary dark:text-brand-accent hover:underline"
              >
                Copy
              </button>
            </div>

            <div className="rounded-lg p-4 bg-[rgb(var(--bg-elevated))] border border-[rgba(148,163,184,0.15)]">
              <div className="text-xs text-[rgb(var(--text-dim))] mb-1 uppercase tracking-wide">
                Max
              </div>
              <div className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                ${result.max}
              </div>
              <button
                onClick={() => copyBid(result.max, 'Max')}
                className="text-xs text-brand-primary dark:text-brand-accent hover:underline"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="bg-[rgb(var(--bg-elevated))] rounded-lg p-4 border border-[rgba(148,163,184,0.15)]">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rationale</div>
            <p className="text-sm text-[rgb(var(--text-secondary))]">{result.reason}</p>
          </div>

          <div className="mt-3">
            <button
              className="cv-btn-ghost"
              onClick={() => {
                const s = faabSummary(player, result.min, result.likely, result.max);
                navigator.clipboard.writeText(s);
                setMsg('FAAB summary copied');
              }}
            >
              Copy all
            </button>
          </div>
        </div>
      )}

      <ActionBar />
      <Toast />
    </main>
  );
}

export default function FaabPage() {
  return (
    <ToolErrorBoundary toolName="FAAB Bid Helper">
      <FaabContent />
    </ToolErrorBoundary>
  );
}
