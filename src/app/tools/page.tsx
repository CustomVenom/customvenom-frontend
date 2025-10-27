import type { Metadata } from 'next';
import Link from 'next/link';

import DebugRequestId from '@/components/DebugRequestId';
import TeamSelectionStatus from '@/components/TeamSelectionStatus';
import ToolsTabs from '@/components/ToolsTabs';
import { TrustSnapshot } from '@/components/TrustSnapshot';
import YahooConnectButton from './YahooConnectButton';

export const metadata: Metadata = {
  title: 'Tools — Custom Venom',
  description: 'Start/Sit, FAAB, and decisions built on explainable projections.',
};

export default function ToolsPage() {
  return (
    <>
      <h1 className="h1">Tools</h1>
      <ToolsTabs />

      <div className="section">
        <TrustSnapshot
          schemaVersion="v1.0.0"
          lastRefresh="2025-10-22T13:06:55.878Z"
          stale={true}
          staleAge="0"
        />
      </div>

      <div className="section space-y-6">
        <p className="text-muted">Interactive decision tools powered by explainable projections.</p>

        <YahooConnectButton />
        <TeamSelectionStatus />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/tools/start-sit"
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-brand-primary dark:hover:border-brand-accent transition-colors"
          >
            <h2 className="h2 mb-2">🆚 Start/Sit</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare two players with risk preferences for your weekly lineup decisions.
            </p>
          </Link>

          <Link
            href="/tools/faab"
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-brand-primary dark:hover:border-brand-accent transition-colors"
          >
            <h2 className="h2 mb-2">💰 FAAB</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Smart waiver bid recommendations with min/likely/max ranges.
            </p>
          </Link>

          <Link
            href="/tools/decisions"
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-brand-primary dark:hover:border-brand-accent transition-colors"
          >
            <h2 className="h2 mb-2">⭐ Decisions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Top 3 weekly actions based on your risk profile and projected lift.
            </p>
          </Link>

          <Link
            href="/tools/leagues"
            prefetch={false}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-brand-primary dark:hover:border-brand-accent transition-colors"
          >
            <h2 className="h2 mb-2">🏈 Leagues</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your fantasy leagues and view your teams and rosters.
            </p>
          </Link>
        </div>
      </div>

      <DebugRequestId />
    </>
  );
}
