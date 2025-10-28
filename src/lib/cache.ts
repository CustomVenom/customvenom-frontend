// Projections cache with stale-while-revalidate pattern
// Phase 3: Client-side caching for instant tool loading

import { trackEvent } from './analytics';

export interface CachedProjections {
  data: unknown;
  timestamp: number;
  week: string;
}

const CACHE_KEY = 'cv_projections_cache';
const FRESH_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Get current week string (e.g., "2025-06")
 */
function getCurrentWeek(): string {
  // For now, use a default week - in production this would be dynamic
  return '2025-06';
}

/**
 * Check if cache exists and is valid
 */
function getCacheStatus(cached: CachedProjections | null): 'fresh' | 'stale' | 'expired' | 'none' {
  if (!cached) return 'none';

  const age = Date.now() - cached.timestamp;

  if (age < FRESH_TIME) return 'fresh';
  if (age < STALE_TIME) return 'stale';
  return 'expired';
}

/**
 * Get cached projections from localStorage
 */
export function getCachedProjections(): CachedProjections | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedProjections = JSON.parse(cached);

    // Validate cache structure
    if (!parsed.data || !parsed.timestamp || !parsed.week) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to read projections cache:', error);
    return null;
  }
}

/**
 * Save projections to cache
 */
export function setCachedProjections(data: unknown, week?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const cached: CachedProjections = {
      data,
      timestamp: Date.now(),
      week: week || getCurrentWeek(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));

    trackEvent('cache_write', {
      type: 'projections',
      week: cached.week,
      size_kb: Math.round(JSON.stringify(data).length / 1024),
    });
  } catch (error) {
    console.warn('Failed to write projections cache:', error);
  }
}

/**
 * Clear projections cache
 */
export function clearProjectionsCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}

/**
 * Get projections with cache-first strategy
 * Returns cached data immediately if fresh, fetches in background if stale
 */
export async function getProjectionsWithCache(
  fetchFn: () => Promise<unknown>,
  options: {
    forceRefresh?: boolean;
    week?: string;
  } = {},
): Promise<{
  data: unknown;
  fromCache: boolean;
  cacheStatus: 'fresh' | 'stale' | 'expired' | 'none';
}> {
  const startTime = performance.now();
  const week = options.week || getCurrentWeek();

  // Check cache first
  const cached = getCachedProjections();
  const status = getCacheStatus(cached);

  // Force refresh bypasses cache
  if (options.forceRefresh) {
    trackEvent('cache_miss', {
      reason: 'force_refresh',
      week,
    });

    const data = await fetchFn();
    setCachedProjections(data, week);

    const duration = Math.round(performance.now() - startTime);
    trackEvent('fetch_complete', {
      source: 'api',
      duration_ms: duration,
      week,
    });

    return {
      data,
      fromCache: false,
      cacheStatus: 'none',
    };
  }

  // Fresh cache: Return immediately
  if (status === 'fresh' && cached) {
    const duration = Math.round(performance.now() - startTime);

    trackEvent('cache_hit', {
      status: 'fresh',
      duration_ms: duration,
      age_minutes: Math.round((Date.now() - cached.timestamp) / 60000),
      week,
    });

    return {
      data: cached.data,
      fromCache: true,
      cacheStatus: 'fresh',
    };
  }

  // Stale cache: Return cached data + refresh in background
  if (status === 'stale' && cached) {
    const duration = Math.round(performance.now() - startTime);

    trackEvent('cache_hit', {
      status: 'stale',
      duration_ms: duration,
      age_minutes: Math.round((Date.now() - cached.timestamp) / 60000),
      week,
    });

    // Background refresh (don't await)
    fetchFn()
      .then((data) => {
        setCachedProjections(data, week);
        trackEvent('cache_refresh', {
          reason: 'stale',
          week,
        });
      })
      .catch((error) => {
        console.warn('Background cache refresh failed:', error);
      });

    return {
      data: cached.data,
      fromCache: true,
      cacheStatus: 'stale',
    };
  }

  // Expired or no cache: Fetch fresh data
  trackEvent('cache_miss', {
    reason: status === 'expired' ? 'expired' : 'not_found',
    week,
  });

  try {
    const data = await fetchFn();
    setCachedProjections(data, week);

    const duration = Math.round(performance.now() - startTime);
    trackEvent('fetch_complete', {
      source: 'api',
      duration_ms: duration,
      week,
    });

    return {
      data,
      fromCache: false,
      cacheStatus: status,
    };
  } catch (error) {
    // If fetch fails and we have expired cache, return it as fallback
    if (cached) {
      trackEvent('cache_fallback', {
        reason: 'fetch_failed',
        age_minutes: Math.round((Date.now() - cached.timestamp) / 60000),
        week,
      });

      return {
        data: cached.data,
        fromCache: true,
        cacheStatus: 'expired',
      };
    }

    // No cache and fetch failed - propagate error
    throw error;
  }
}

/**
 * Warm up cache by pre-fetching projections
 * Call this on app load for instant tool access
 */
export async function warmProjectionsCache(
  fetchFn: () => Promise<unknown>,
  options: {
    silent?: boolean; // Don't throw errors, just log
    week?: string;
  } = {},
): Promise<void> {
  try {
    trackEvent('cache_warmup', {
      type: 'projections',
      week: options.week || getCurrentWeek(),
    });

    const result = await getProjectionsWithCache(fetchFn, options);

    trackEvent('cache_warmup_complete', {
      from_cache: result.fromCache,
      cache_status: result.cacheStatus,
      week: options.week || getCurrentWeek(),
    });
  } catch (error) {
    console.warn('Cache warmup failed:', error);

    if (!options.silent) {
      throw error;
    }
  }
}

/**
 * Get cache statistics for analytics dashboard
 */
export function getCacheStats(): {
  exists: boolean;
  age_minutes: number;
  status: 'fresh' | 'stale' | 'expired' | 'none';
  week: string;
  size_kb: number;
} | null {
  const cached = getCachedProjections();

  if (!cached) {
    return {
      exists: false,
      age_minutes: 0,
      status: 'none',
      week: '',
      size_kb: 0,
    };
  }

  const age = Date.now() - cached.timestamp;

  return {
    exists: true,
    age_minutes: Math.round(age / 60000),
    status: getCacheStatus(cached),
    week: cached.week,
    size_kb: Math.round(JSON.stringify(cached.data).length / 1024),
  };
}
