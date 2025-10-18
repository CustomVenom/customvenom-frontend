'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  toolName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ToolErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to Sentry with tool-specific tags
    Sentry.captureException(error, {
      tags: {
        error_boundary: 'tool',
        tool_name: this.props.toolName || 'unknown',
      },
      level: 'error',
      contexts: {
        react: errorInfo,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Tool Error
              </h3>
              
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                {this.props.toolName || 'This tool'} encountered an error. The issue has been logged.
              </p>
              
              {this.state.error?.message && (
                <div className="bg-white dark:bg-gray-900 rounded p-3 mb-3">
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-mono break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="text-sm px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Try again
                </button>
                
                <button
                  onClick={() => window.location.href = '/tools'}
                  className="text-sm px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Back to tools
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

