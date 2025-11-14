/**
 * Centralized projection utility functions
 *
 * Architecture Law #3: API is Contract, UI is Presentation
 *
 * This module provides centralized functions for checking projection enhancement status.
 * Use these functions everywhere instead of duplicating logic.
 */

/**
 * Type for projection objects that may have enhancement data
 */
export interface ProjectionWithEnhancement {
  enhanced_floor?: number | null;
  enhanced_ceiling?: number | null;
  enhancement_method?: string;
  [key: string]: unknown;
}

/**
 * Determines if a projection has real enhancement data (not fallback or unavailable)
 *
 * A projection is considered "enhanced" if:
 * - enhanced_floor is defined and not null
 * - enhancement_method is not 'fallback' or 'unavailable'
 *
 * @param projection - The projection object to check
 * @returns true if the projection has real enhancement data, false otherwise
 *
 * @example
 * ```typescript
 * import { isEnhanced } from '@/lib/projection-utils';
 *
 * if (isEnhanced(projection)) {
 *   // Show enhanced Strike Range
 * } else {
 *   // Show baseline only with warning
 * }
 * ```
 */
export function isEnhanced(projection: ProjectionWithEnhancement): boolean {
  return (
    projection.enhanced_floor !== undefined &&
    projection.enhanced_floor !== null &&
    projection.enhancement_method !== 'fallback' &&
    projection.enhancement_method !== 'unavailable'
  );
}

/**
 * Gets the floor value for a projection, preferring enhanced if available
 *
 * @param projection - The projection object
 * @param fallback - Fallback value if neither enhanced nor baseline floor is available
 * @returns The floor value to use
 */
export function getFloor(
  projection: ProjectionWithEnhancement & { floor?: number },
  fallback: number = 0,
): number {
  if (isEnhanced(projection) && typeof projection.enhanced_floor === 'number') {
    return projection.enhanced_floor;
  }
  return projection.floor ?? fallback;
}

/**
 * Gets the ceiling value for a projection, preferring enhanced if available
 *
 * @param projection - The projection object
 * @param fallback - Fallback value if neither enhanced nor baseline ceiling is available
 * @returns The ceiling value to use
 */
export function getCeiling(
  projection: ProjectionWithEnhancement & { ceiling?: number },
  fallback: number = 0,
): number {
  if (isEnhanced(projection) && typeof projection.enhanced_ceiling === 'number') {
    return projection.enhanced_ceiling;
  }
  return projection.ceiling ?? fallback;
}
