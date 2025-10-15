export interface Entitlements {
  isPro: boolean;
  features: {
    compareView: boolean;
    csvExport: boolean;
    recapEmail: boolean;
  };
}

// Mock entitlements for now - in production this would check Stripe customer portal
export async function getEntitlements(sessionId?: string): Promise<Entitlements> {
  // For now, mock Pro access if sessionId is provided
  // In production, you'd verify the session with Stripe and check customer status
  const isPro = Boolean(sessionId);
  
  return {
    isPro,
    features: {
      compareView: isPro,
      csvExport: isPro,
      recapEmail: isPro,
    },
  };
}

// Check if user has specific feature access
export function hasFeature(entitlements: Entitlements, feature: keyof Entitlements['features']): boolean {
  return entitlements.features[feature];
}
