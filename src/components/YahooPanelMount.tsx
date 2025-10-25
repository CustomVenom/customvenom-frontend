'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import YahooPanelClient from '@/components/YahooPanelClient';

export default function YahooPanelMount() {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-3 bg-yellow-50 border rounded">
          Yahoo panel error. Try again.
        </div>
      }
    >
      <YahooPanelClient />
    </ErrorBoundary>
  );
}
