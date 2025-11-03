'use client';

import CacheWarmer from '@/components/CacheWarmer';
import { DevOverlay } from '@/components/DevOverlay';
import KeyboardCheatsheet from '@/components/KeyboardCheatsheet';
import { MobileDock } from '@/components/MobileDock';
import { QuickNav } from '@/components/QuickNav';
import { SkipLink } from '@/components/SkipLink';
import { TrustRibbon } from '@/components/TrustRibbon';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <TrustRibbon schemaVersion="v1" lastRefresh={new Date().toISOString()} stale={false} />
      <CacheWarmer />
      <KeyboardCheatsheet />
      <DevOverlay stale={false} />
      <QuickNav />
      <div className="flex min-h-screen">
        <main id="main-content" className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileDock />
    </>
  );
}
