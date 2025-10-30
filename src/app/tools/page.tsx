'use client';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ConnectLeague = dynamicImport(() => import('@/components/ConnectLeague'), { ssr: false });

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 grid gap-4">
      <div suppressHydrationWarning>
        <ConnectLeague />
      </div>
    </div>
  );
}
