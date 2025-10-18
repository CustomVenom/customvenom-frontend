'use client';

import CacheWarmer from '@/components/CacheWarmer';
import KeyboardCheatsheet from '@/components/KeyboardCheatsheet';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CacheWarmer />
      <KeyboardCheatsheet />
      {children}
    </>
  );
}

