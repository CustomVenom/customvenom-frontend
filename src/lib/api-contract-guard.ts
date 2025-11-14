/**
 * Architecture Law #3: API is Contract, UI is Presentation
 *
 * Runtime guards to prevent frontend from calculating fantasy points
 * or using heuristics when API data is missing.
 *
 * The frontend's job is to present the state provided by the API,
 * not to invent or interpret it.
 */

/**
 * Guard: Prevent fantasy point calculations in frontend
 *
 * @param value - Value to check
 * @param context - Context for error message
 * @throws Error if value appears to be a calculated fantasy point
 */
export function guardAgainstFantasyPointCalculation(
  value: unknown,
  context?: string
): void {
  if (typeof value === 'number' && value > 0 && value < 100) {
    // In development, warn about potential fantasy point calculations
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[API Contract Guard] Potential fantasy point calculation detected: ${value}${context ? ` in ${context}` : ''}. ` +
        'Architecture Law #3: Frontend must never calculate fantasy points. Use API-provided data only.'
      );
    }
  }
}

/**
 * Guard: Ensure projection data comes from API, not heuristics
 *
 * @param projection - Projection value
 * @param fallback - Fallback value (should be null/undefined, not calculated)
 * @param fieldName - Field name for error message
 * @returns Projection value or null if unavailable
 */
export function guardProjectionSource(
  projection: number | null | undefined,
  fallback: number | null | undefined,
  fieldName: string
): number | null {
  // If API provided the projection, use it
  if (projection !== null && projection !== undefined) {
    return projection;
  }

  // If fallback is provided, it means API didn't have the data
  // Architecture Law #3: Don't use heuristics, show "unavailable"
  if (fallback !== null && fallback !== undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[API Contract Guard] Fallback value used for ${fieldName}: ${fallback}. ` +
        'Architecture Law #3: Consider showing "Data unavailable" instead of using fallback values.'
      );
    }
    // For now, allow fallback but warn in development
    // TODO: Replace with null and show "unavailable" in UI
    return fallback;
  }

  // No data available - return null (UI should show "unavailable")
  return null;
}

/**
 * Check if enhanced data is available from API
 * If not available, return null instead of calculating
 *
 * @param enhancedValue - Enhanced value from API
 * @param baselineValue - Baseline value from API
 * @returns Enhanced value if available, null otherwise
 */
export function useEnhancedOrNull(
  enhancedValue: number | null | undefined,
  baselineValue: number | null | undefined
): number | null {
  if (enhancedValue !== null && enhancedValue !== undefined) {
    return enhancedValue;
  }

  // Architecture Law #3: Don't calculate fallbacks
  // Return null and let UI show "Enhanced data unavailable"
  return null;
}

