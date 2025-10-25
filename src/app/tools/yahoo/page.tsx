'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Redirect shim: /tools/yahoo → /tools/leagues
// Keeps backward compatibility for old links while maintaining canonical OAuth destination
export default function YahooToolPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tools/leagues');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-muted">Redirecting to leagues...</div>
      </div>
    </div>
  );
}
