'use client';
import React from 'react';

type State = { hasError: boolean; error?: Error };
export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Minimal log; wire Sentry if available
    console.error('ErrorBoundary:', error, info);
    // @ts-expect-error optional Sentry
    if (typeof window !== 'undefined' && window.Sentry) window.Sentry.captureException(error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded bg-red-50">
          <h2 className="font-semibold">Something went wrong</h2>
          <details className="mt-2 text-sm whitespace-pre-wrap">
            <summary>Error details</summary>
            {this.state.error?.toString() ?? 'Unknown'}
          </details>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-3 py-2 bg-red-600 text-white rounded"
            aria-label="Reload page"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
