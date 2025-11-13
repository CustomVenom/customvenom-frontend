'use client';

import { useEffect } from 'react';
import { SportRegistry } from '@/lib/sports/registry';
import { NFLClient } from '@/lib/sports/nfl/client';
import { NBAClient } from '@/lib/sports/nba/client';
import { ApiClient } from '@/lib/sports/base/SportClient';

/**
 * Client-side component to initialize sport clients
 * Registers NFL and NBA clients with SportRegistry on mount
 */
export function SportClientInitializer() {
  useEffect(() => {
    // Only register once
    if (SportRegistry.all().length === 0) {
      // Initialize API client
      const api: ApiClient = {
        get: async (path: string) => {
          const base = process.env['NEXT_PUBLIC_API_BASE'] || '';
          // Ensure path starts with / if base doesn't end with /
          const fullPath =
            base && !base.endsWith('/') && !path.startsWith('/')
              ? `${base}/${path}`
              : `${base}${path}`;
          const res = await fetch(fullPath, { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        },
      };

      // Register sport clients
      SportRegistry.register(new NFLClient(api));
      SportRegistry.register(new NBAClient(api));
    }
  }, []);

  return null; // This component doesn't render anything
}
