'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function YahooConnect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard page where Yahoo connection is handled
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Redirecting to Dashboard…</p>
      </div>
    </div>
  );
}
