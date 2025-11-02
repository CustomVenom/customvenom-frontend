'use client';

import React from 'react';

type Props = { children: React.ReactNode; fallback?: React.ReactNode };

export class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override componentDidCatch(error: unknown) {
    // Minimal log; do not leak details in UI
    console.error(JSON.stringify({ scope: 'ui.error-boundary', err: String(error) }));
  }
  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-6 text-center space-y-4" role="alert">
            <h2 className="text-xl font-semibold text-danger mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors min-h-[44px]"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
