'use client';
import dynamic from 'next/dynamic';

const ConnectLeague = dynamic(() => import('@/components/ConnectLeague'), { ssr: false });

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 grid gap-4">
      <ConnectLeague />
    </div>
  );
}
