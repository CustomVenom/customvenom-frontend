'use client';

import CacheWarmer from '@/components/CacheWarmer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CacheWarmer />
      {children}
    </>
  );
}

