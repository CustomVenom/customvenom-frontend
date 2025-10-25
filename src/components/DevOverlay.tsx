'use client';

import React, { useState, useEffect } from 'react';

interface DevOverlayProps {
  requestId?: string;
  cache?: string;
  stale?: boolean;
  route?: string;
}

/**
 * DevOverlay: Dev-only diagnostic overlay
 * Toggle with backtick key (`)
 * Shows request metadata for debugging
 */
export function DevOverlay({ requestId, cache, stale = false, route }: DevOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only enable in development
    const nodeEnv = process.env['NODE_ENV'] || '';
    if (nodeEnv !== 'development') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === 'Backquote') {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Don't render in production
  const nodeEnv = process.env['NODE_ENV'] || '';
  if (nodeEnv !== 'development') return null;

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl font-mono text-xs max-w-md">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-yellow-400">Dev Overlay</span>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
      <div className="space-y-1">
        {requestId && (
          <div>
            <span className="text-gray-400">request_id:</span> {requestId}
          </div>
        )}
        {cache && (
          <div>
            <span className="text-gray-400">cache:</span> {cache}
          </div>
        )}
        {stale !== undefined && (
          <div>
            <span className="text-gray-400">stale:</span>{' '}
            <span className={stale ? 'text-yellow-400' : 'text-green-400'}>
              {stale ? 'true' : 'false'}
            </span>
          </div>
        )}
        {route && (
          <div>
            <span className="text-gray-400">route:</span> {route}
          </div>
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-gray-700 text-gray-500 text-xs">
        Press ` to toggle
      </div>
    </div>
  );
}
