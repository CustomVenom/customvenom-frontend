'use client';

import type { Projection } from '@customvenom/lib/adapters/projections-adapter';

interface Props {
  dataset: Projection[];
}

export default function ComparisonPanel({ dataset: _dataset }: Props) {
  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded">
      <h3 className="text-lg font-semibold mb-2">Comparison Results</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Select two players above to see comparison
      </p>
    </div>
  );
}
