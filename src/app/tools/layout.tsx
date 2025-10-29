import { TrustSnapshot } from '@/components/TrustSnapshot';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <TrustSnapshot />
      {children}
    </div>
  );
}
