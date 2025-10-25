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
      return this.props.fallback ?? (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          Something went wrong. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}
