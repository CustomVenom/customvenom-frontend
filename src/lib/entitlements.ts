/**
 * User Entitlements Helper
 *
 * Checks user subscription/entitlement status from API.
 * Type definition matches @customvenom/contracts schema for consistency.
 */

/**
 * User entitlements type (matches @customvenom/contracts schema)
 * Note: Defined locally since frontend and workers-api are separate repos
 */
export type Entitlements = {
  plan: 'free' | 'pro';
  features: {
    nba: boolean;
    optimizer: boolean;
    league_specific: boolean;
  };
  expires_at?: string | null;
};

/**
 * Check user entitlements from API
 *
 * @returns Promise resolving to entitlements object with plan and features
 */
export async function checkEntitlements(): Promise<Entitlements> {
  try {
    const response = await fetch('/api/user/entitlements', {
      credentials: 'include',
    });

    if (!response.ok) {
      // If endpoint doesn't exist yet, return default (free tier)
      if (response.status === 404) {
        return {
          plan: 'free',
          features: {
            nba: false,
            optimizer: false,
            league_specific: false,
          },
        };
      }

      throw new Error(`Failed to fetch entitlements: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // On error, default to free tier
    console.warn('Failed to check entitlements, defaulting to free tier', error);
    return {
      plan: 'free',
      features: {
        nba: false,
        optimizer: false,
        league_specific: false,
      },
    };
  }
}

/**
 * Check if user has Pro plan
 *
 * @param entitlements - Entitlements object (from checkEntitlements())
 * @returns true if user has 'pro' plan
 */
export function isPro(entitlements: Entitlements): boolean {
  return entitlements.plan === 'pro';
}
