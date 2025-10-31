export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import ToolsPageClient from '@/components/ToolsPageClient';

export default function ToolsPage() {
  return (
    <div suppressHydrationWarning>
      <ToolsPageClient />
    </div>
  );
}
