'use client';

import CacheWarmer from '@/components/CacheWarmer';
import KeyboardCheatsheet from '@/components/KeyboardCheatsheet';
import { TrustRibbon } from '@/components/TrustRibbon';
import { DevOverlay } from '@/components/DevOverlay';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TrustRibbon schemaVersion="v1" lastRefresh={new Date().toISOString()} stale={false} />
      <CacheWarmer />
      <KeyboardCheatsheet />
      <DevOverlay requestId={undefined} cache={undefined} stale={false} route={undefined} />
      {children}
    </>
  );
}
