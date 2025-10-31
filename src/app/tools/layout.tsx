import { TrustSnapshot } from './trust-snapshot';

export default async function ToolsLayout({ children }: { children: React.ReactNode }) {
  const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

  let schemaVersion = 'v1';
  let lastRefresh = new Date().toISOString();
  let isStale = false;

  try {
    const res = await fetch(`${API_BASE}/health`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    });

    const data = await res.json();
    schemaVersion = data.schema_version || 'v1';
    lastRefresh = data.last_refresh || new Date().toISOString();
    isStale = res.headers.get('x-stale') === 'true';
  } catch (error) {
    console.error('Failed to fetch health:', error);
    // Use defaults on error
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <TrustSnapshot schemaVersion={schemaVersion} lastRefresh={lastRefresh} isStale={isStale} />
      </div>
      {children}
    </div>
  );
}
