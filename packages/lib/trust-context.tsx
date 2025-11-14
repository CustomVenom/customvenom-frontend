'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type TrustState = {
  schemaVersion?: string | null;
  lastRefresh?: string | null;
};

const TrustContext = createContext<TrustState>({});

export function TrustProvider({ children }: { children: ReactNode }) {
  const [trust, setTrust] = useState<TrustState>({});

  useEffect(() => {
    // Listen for trust updates from successful fetches (browser-only)
    if (typeof window === 'undefined') return;

    const handler = (e: CustomEvent) => {
      setTrust(e.detail);
    };
    window.addEventListener('trust-update', handler as any);
    return () => window.removeEventListener('trust-update', handler as any);
  }, []);

  return <TrustContext.Provider value={trust}>{children}</TrustContext.Provider>;
}

export function useTrustContext() {
  return useContext(TrustContext);
}

// Helper to emit trust updates (browser-only)
export function emitTrustUpdate(trust: TrustState) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('trust-update', { detail: trust }));
}
