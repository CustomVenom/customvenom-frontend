'use client';

import { TrustSnapshot } from '@/components/TrustSnapshot';

export default function ToolsInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6" suppressHydrationWarning>
      <TrustSnapshot />
      {children}
    </div>
  );
}
