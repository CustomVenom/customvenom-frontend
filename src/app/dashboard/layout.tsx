import { ToolLayout } from '@/components/layouts';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout showBreadcrumbs={true}>{children}</ToolLayout>;
}
