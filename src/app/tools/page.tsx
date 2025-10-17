import Link from 'next/link';
import type { Metadata } from 'next';
import ToolsTabs from '@/components/ToolsTabs';

export const metadata: Metadata = {
  title: 'Tools — Custom Venom',
  description: 'Start/Sit, FAAB, and decisions built on explainable projections.',
};

export default function ToolsPage() {
  return (
    <>
      <h1 className="h1">Tools</h1>
      <ToolsTabs />
      
      <div className="section space-y-6">
        <p className="text-muted">
          Interactive decision tools powered by explainable projections.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/tools/start-sit" className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-brand-primary dark:hover:border-brand-accent transition-colors">
            <h2 className="h2 mb-2">🆚 Start/Sit</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare two players with risk preferences for your weekly lineup decisions.
            </p>
          </Link>

          <Link href="/tools/faab" className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-brand-primary dark:hover:border-brand-accent transition-colors">
            <h2 className="h2 mb-2">💰 FAAB</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Smart waiver bid recommendations with min/likely/max ranges.
            </p>
          </Link>

          <Link href="/tools/decisions" className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-brand-primary dark:hover:border-brand-accent transition-colors">
            <h2 className="h2 mb-2">⭐ Decisions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Top 3 weekly actions based on your risk profile and projected lift.
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}

