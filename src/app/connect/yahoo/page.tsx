'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function YahooConnect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to tools page where Yahoo connection is handled
    router.push('/tools');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Redirecting to Tools…</p>
      </div>
    </div>
  );
}
