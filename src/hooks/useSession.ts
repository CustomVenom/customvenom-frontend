'use client';
import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/api';

type Sess = {
  ok: true;
  uid: string;
  providers: string[];
  yahoo?: { expires_at: number } | null;
};

export function useSession() {
  const [sess, setSess] = useState<Sess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const result = await fetchJson('/api/session');
        if (alive) setSess(result.ok ? (result.data as Sess) : null);
      } catch (error) {
        console.error('Session fetch error:', error);
        if (alive) setSess(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { sess, loading };
}
