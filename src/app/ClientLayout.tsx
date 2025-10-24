'use client';

import CacheWarmer from '@/components/CacheWarmer';
import KeyboardCheatsheet from '@/components/KeyboardCheatsheet';
import { TrustRibbon } from '@/components/TrustRibbon';
import { DevOverlay } from '@/components/DevOverlay';
import { SideNav } from '@/components/SideNav';
import { MobileDock } from '@/components/MobileDock';
import { SkipLink } from '@/components/SkipLink';
import { QuickNav } from '@/components/QuickNav';

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
        <SideNav />
        <main id="main-content" className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileDock />
    </>
  );
}
