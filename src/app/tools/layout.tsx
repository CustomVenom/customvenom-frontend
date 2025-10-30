import nextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const ToolsInner = nextDynamic(() => import('./tools-inner'), { ssr: false });

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <ToolsInner>{children}</ToolsInner>
    </div>
  );
}
