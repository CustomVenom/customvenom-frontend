'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; requestId?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry with request_id and route tags
    Sentry.captureException(error, {
      tags: {
        error_boundary: 'root',
        request_id: error.requestId || error.digest || 'unknown',
      },
      level: 'error',
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
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
        
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          We&apos;ve been notified and are looking into it.
        </p>
        
        {error.message && (
          <div className="bg-gray-50 rounded p-4 mb-6">
            <p className="text-sm text-gray-700 font-mono break-words">
              {error.message}
            </p>
          </div>
        )}
        
        {(error.requestId || error.digest) && (
          <div className="text-center text-xs text-gray-500 mb-6">
            Error ID: {error.requestId || error.digest}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition-colors text-center"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}

