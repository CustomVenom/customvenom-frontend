'use client';

import { useEffect } from 'react';

export default function ConnectSuccess() {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const params = new URLSearchParams(search);
  const provider = (params.get('provider') || 'your').toUpperCase();
  const ret = params.get('ret') || '/tools';

  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = ret;
    }, 1200);
    return () => clearTimeout(t);
  }, [ret]);

  return (
    <main className="mx-auto max-w-md px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">You’re connected</h1>
      <p className="mt-2 text-sm opacity-80">Your {provider} login worked. Redirecting…</p>
      <div className="mt-6">
        <a className="cv-btn-primary" href={ret}>
          Continue
        </a>
      </div>
    </main>
  );
}
