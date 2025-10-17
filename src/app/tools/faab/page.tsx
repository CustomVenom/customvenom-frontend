'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import ToolsTabs from '@/components/ToolsTabs';
import EmptyState from '@/components/EmptyState';
import ActionBar from '@/components/ActionBar';
import Button from '@/components/Button';
import { useToast } from '@/components/Toast';

export default function FaabPage() {
  const [player, setPlayer] = useState('');
  const [budget, setBudget] = useState('100');
  const [result, setResult] = useState<{
    min: number;
    likely: number;
    max: number;
    reason: string;
  } | null>(null);
  
  const { setMsg, Toast } = useToast();

  function handleExample() {
    setPlayer('Jahmyr Gibbs');
    setBudget('100');
  }

  async function handleCalculate() {
    // TODO: Wire to API endpoint
    // For now, return mock data
    setResult({
      min: 15,
      likely: 22,
      max: 35,
      reason: 'High usage upside with favorable schedule',
    });
  }

  function copyBid(amount: number) {
    navigator.clipboard.writeText(amount.toString());
    setMsg(`Copied: $${amount}`);
  }

  return (
    <main className="container section space-y-4">
      <h1 className="h1">FAAB Bid Helper</h1>
      <ToolsTabs />

      {!result ? (
        <EmptyState 
          title="Calculate FAAB bid range"
          onExample={handleExample}
        >
          Enter a player name and your remaining budget for smart bid recommendations.
        </EmptyState>
      ) : null}

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Player Name
          </label>
          <input
            type="text"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            placeholder="e.g., Jahmyr Gibbs"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Remaining Budget ($)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="100"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
      </div>

      {result && (
        <div className="border border-brand-primary dark:border-brand-accent rounded-lg p-6 bg-brand-primary/5 dark:bg-brand-accent/10">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
            Bid Recommendations for {player}
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Min</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                ${result.min}
              </div>
              <button 
                onClick={() => copyBid(result.min)}
                className="text-xs text-brand-primary dark:text-brand-accent hover:underline"
              >
                Copy
              </button>
            </div>

            <div className="border border-brand-primary dark:border-brand-accent rounded-lg p-4 bg-brand-primary/10 dark:bg-brand-accent/20">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Likely</div>
              <div className="text-2xl font-semibold text-brand-primary dark:text-brand-accent mb-2">
                ${result.likely}
              </div>
              <button 
                onClick={() => copyBid(result.likely)}
                className="text-xs text-brand-primary dark:text-brand-accent hover:underline"
              >
                Copy
              </button>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                ${result.max}
              </div>
              <button 
                onClick={() => copyBid(result.max)}
                className="text-xs text-brand-primary dark:text-brand-accent hover:underline"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rationale</div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.reason}</p>
          </div>
        </div>
      )}

      <ActionBar />
      <Toast />
    </main>
  );
}

