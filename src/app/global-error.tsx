'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical global errors to Sentry
    Sentry.captureException(error, {
      tags: {
        error_boundary: 'global',
        error_digest: error.digest || 'unknown',
      },
      level: 'fatal',
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))]">
          <div className="max-w-md w-full bg-[rgb(var(--bg-card))] shadow-2xl rounded-lg p-8 border border-[rgba(148,163,184,0.1)]">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
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
            </div>
            
            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] text-center mb-2">
              Application Error
            </h2>
            
            <p className="text-[rgb(var(--text-secondary))] text-center mb-6">
              A critical error occurred. Our team has been notified.
            </p>
            
            {error.digest && (
              <div className="text-center text-xs text-[rgb(var(--text-muted))] mb-6">
                Error ID: {error.digest}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 bg-[rgb(var(--cv-primary))] text-[#0A0E1A] rounded-lg hover:bg-[rgb(var(--success))] transition-all font-semibold shadow-lg"
              >
                Try again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2 bg-[rgba(148,163,184,0.1)] text-[rgb(var(--text-primary))] rounded-lg hover:bg-[rgba(148,163,184,0.2)] transition-all font-semibold border border-[rgba(148,163,184,0.2)]"
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

