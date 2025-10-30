import nextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const ConnectLeague = nextDynamic(() => import('@/components/ConnectLeague'), { ssr: false });

export default function ToolsPage() {
  return (
    <div suppressHydrationWarning className="p-4 space-y-6">
      <ConnectLeague />
    </div>
  );
}
