'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const YahooPanel = dynamic(() => import('./YahooPanel'), {
  ssr: true,
});

function LoadingFallback() {
  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
}

export default function YahooPanelWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <YahooPanel />
    </Suspense>
  );
}
