'use client';
import dynamic from 'next/dynamic';

const LeaguesPanel = dynamic(() => import('@/components/LeaguesPanel'), { ssr: false });

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 grid gap-4">
      <LeaguesPanel />
    </div>
  );
}
