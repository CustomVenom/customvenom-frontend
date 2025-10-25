'use client';

import { useEffect } from 'react';

import { warmProjectionsCacheBackground } from '@/lib/tools';

/**
 * CacheWarmer component - Warms up projections cache on mount
 * Place this in layout or high-level component for instant tool loading
 */
export default function CacheWarmer() {
  useEffect(() => {
    // Warm cache on mount (background, non-blocking)
    warmProjectionsCacheBackground();
  }, []);

  // This component renders nothing
  return null;
}
