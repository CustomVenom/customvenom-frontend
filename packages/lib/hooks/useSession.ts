'use client';
import { useState, useEffect } from 'react';

export type CvSession = {
  user?: { id: string; email?: string };
  yahoo?: { connected: boolean };
} | null;

export function useSession() {
  const [session, setSession] = useState<CvSession>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
        } else {
          setError(new Error('Failed to load session'));
        }
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Session load failed');
        setError(err);
        console.error('Session load failed:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  return { session, loading, error };
}
