import ToolsInner from './tools-inner';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <ToolsInner>{children}</ToolsInner>;
}
