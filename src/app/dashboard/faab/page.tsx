'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import ActionBar from '@/components/ActionBar';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { ToolErrorBoundary } from '@/components/ToolErrorBoundary';
import { ToolPageHeader } from '@/components/ToolPageHeader';
import { GlossaryTip } from '@/components/ui/GlossaryTip';
import { Breadcrumb } from '@/components/Breadcrumb';
import { LeagueContextHeader } from '@/components/LeagueContextHeader';
import { useLeagueContext } from '@/hooks/useLeagueContext';
import { trackToolUsage, trackFeatureInteraction } from '@/lib/analytics';
import { faabSummary } from '@/lib/summary';
import { ConnectionGuard, useIsConnected } from '@/components/ConnectionGuard';
import { useUserStore } from '@/lib/store';
import { getCurrentWeek } from '@/lib/utils';
import { TrustSnapshot } from '@/components/TrustSnapshot';
import { queryClient } from '@/app/providers';

function FaabContent() {
  const leagueContext = useLeagueContext();
  const isConnected = useIsConnected(leagueContext);
  const searchParams = useSearchParams();
  const { activeLeague } = useUserStore();

  // Pre-fill from URL params
  const [player, setPlayer] = useState(searchParams.get('target') || '');
  const [budget, setBudget] = useState('100');
  const [result, setResult] = useState<{
    min: number;
    likely: number;
    max: number;
    reason: string;
  } | null>(null);

  const [trustHeaders, setTrustHeaders] = useState<{
    schemaVersion: string;
    lastRefresh: string;
    requestId: string;
    stale?: string;
  } | null>(null);

  const { setMsg, Toast } = useToast();

  // Track tool view
  useEffect(() => {
    trackToolUsage('FAAB', { action: 'viewed' });
  }, []);

  const handleCalculate = useCallback(async () => {
    // Track calculation
    trackToolUsage('FAAB', {
      action: 'calculate',
      player: player || '',
      budget: parseInt(budget) || 0,
    });

    if (!player || !budget) {
      setMsg('Please enter both player name and budget');
      return;
    }

    try {
      // Call FAAB API endpoint
      const currentWeek = getCurrentWeek();
      const params = new URLSearchParams({
        player_id: player, // API may accept player_id or player name
        budget: budget,
        week: String(leagueContext.week || currentWeek), // Use current week from context or utility
      });

      const res = await fetch(`/api/faab?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch FAAB bands: ${res.status}`);
      }

      // Extract trust headers
      setTrustHeaders({
        schemaVersion: res.headers.get('x-schema-version') || 'unknown',
        lastRefresh: res.headers.get('x-last-refresh') || new Date().toISOString(),
        requestId: res.headers.get('x-request-id') || 'unknown',
        stale: res.headers.get('x-stale') || undefined,
      });

      const data = await res.json();

      // Handle API response format
      // API may return items array or direct min/likely/max
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        setResult({
          min: item.min || item.min_bid || 0,
          likely: item.likely || item.recommended_bid || 0,
          max: item.max || item.max_bid || 0,
          reason: item.reason || item.rationale || 'Based on projected value and market conditions',
        });
      } else if (data.min !== undefined && data.likely !== undefined && data.max !== undefined) {
        setResult({
          min: data.min,
          likely: data.likely,
          max: data.max,
          reason: data.reason || data.rationale || 'Based on projected value and market conditions',
        });
      } else {
        // Fallback to calculated estimate if API format is unexpected
        const budgetNum = parseInt(budget);
        const estimatedMin = Math.floor(budgetNum * 0.15);
        const estimatedLikely = Math.floor(budgetNum * 0.22);
        const estimatedMax = Math.floor(budgetNum * 0.35);
        setResult({
          min: estimatedMin,
          likely: estimatedLikely,
          max: estimatedMax,
          reason:
            'Estimated bid range based on remaining budget. API response format may need adjustment.',
        });
      }

      // Invalidate roster query after bid calculation (for cache invalidation)
      if (activeLeague) {
        queryClient.invalidateQueries({ queryKey: ['roster', activeLeague] });
      }
    } catch (error) {
      console.error('FAAB calculation error:', error);
      setMsg('Failed to calculate FAAB bid. Please try again.');
      // Fallback to estimated values
      const budgetNum = parseInt(budget);
      setResult({
        min: Math.floor(budgetNum * 0.15),
        likely: Math.floor(budgetNum * 0.22),
        max: Math.floor(budgetNum * 0.35),
        reason: 'Estimated bid range based on remaining budget',
      });
    }
  }, [player, budget, leagueContext.week, activeLeague, setMsg]);

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
  }, [player, budget, handleCalculate]);

  function copyBid(amount: number, label: 'Min' | 'Likely' | 'Max') {
    trackFeatureInteraction('copy_bid', label.toLowerCase(), { tool: 'FAAB', amount });
    navigator.clipboard.writeText(amount.toString());
    setMsg(`${label} bid copied`);
  }

  function handleExample() {
    trackFeatureInteraction('example', 'loaded', { tool: 'FAAB' });
    setPlayer('Jahmyr Gibbs');
    setBudget('100');
  }

  return (
    <ConnectionGuard isConnected={isConnected}>
      <main className="container section space-y-4">
        <Breadcrumb items={[{ label: 'FAAB Helper', href: '/dashboard/faab' }]} />

        {!leagueContext.isLoading && (
          <LeagueContextHeader
            leagueName={leagueContext.leagueName}
            teamName={leagueContext.teamName}
            week={leagueContext.week}
            scoringType={leagueContext.scoringType}
          />
        )}

        <ToolPageHeader title="FAAB Bid Helper" currentTool="faab" />
        <p className="text-sm text-muted mb-4">
          <GlossaryTip term="faab band" />
        </p>

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
                  className="text-xs text-[rgb(var(--cv-primary-strong))] dark:text-brand-accent hover:underline"
                >
                  Copy
                </button>
              </div>

              <div className="border border-brand-primary dark:border-brand-accent rounded-lg p-4 bg-brand-primary/10 dark:bg-brand-accent/20">
                <div className="text-xs text-[rgb(var(--text-dim))] mb-1 uppercase tracking-wide">
                  Likely
                </div>
                <div className="text-2xl font-semibold text-[rgb(var(--cv-primary-strong))] dark:text-brand-accent mb-2">
                  ${result.likely}
                </div>
                <button
                  onClick={() => copyBid(result.likely, 'Likely')}
                  className="text-xs text-[rgb(var(--cv-primary-strong))] dark:text-brand-accent hover:underline"
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
                  className="text-xs text-[rgb(var(--cv-primary-strong))] dark:text-brand-accent hover:underline"
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
        {trustHeaders && (
          <TrustSnapshot
            trust={{
              schemaVersion: trustHeaders.schemaVersion,
              lastRefresh: trustHeaders.lastRefresh,
              requestId: trustHeaders.requestId,
              stale: trustHeaders.stale,
            }}
          />
        )}
        <Toast />
      </main>
    </ConnectionGuard>
  );
}

export default function FaabPage() {
  return (
    <ToolErrorBoundary toolName="FAAB Bid Helper">
      <FaabContent />
    </ToolErrorBoundary>
  );
}
