/**
 * Feature flags for CustomVenom
 *
 * Toggle these to enable/disable features without code changes
 */

export const FEATURES = {
  /**
   * Master paywall switch
   * - false: All users have full access (development mode)
   * - true: Enforce tier-based restrictions
   */
  PAYWALL_ENABLED: false,

  /**
   * Team switching restrictions
   * - When PAYWALL_ENABLED = true AND user is free tier:
   *   - First selection auto-saves and locks
   *   - Switching requires Pro upgrade
   * - When PAYWALL_ENABLED = false:
   *   - All users can switch freely
   */
  TEAM_SWITCHING_RESTRICTED: false,
} as const;

/**
 * Helper to check if a feature requires Pro tier
 * Returns false (allow) when paywall is disabled
 */
export function requiresPro(feature: keyof typeof FEATURES): boolean {
  if (!FEATURES.PAYWALL_ENABLED) {
    return false; // Always allow when paywall disabled
  }

  return !!FEATURES[feature];
}
