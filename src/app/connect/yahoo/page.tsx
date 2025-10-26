'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function YahooConnect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to custom Yahoo OAuth connect endpoint
    router.push('https://api.customvenom.com/api/connect/start?host=yahoo&from=/tools');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Redirecting to Yahoo…</p>
      </div>
    </div>
  );
}
