"use client";
import { useEffect, useState } from "react";

type Sess = {
  ok: true;
  uid: string;
  providers: string[];
  yahoo?: { expires_at: number } | null
};

export function useSession() {
  const [sess, setSess] = useState<Sess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const r = await fetch('/api/session', { credentials: 'include' });
        const b = await r.json();
        if (alive) setSess(b.ok ? b : null);
      } catch (error) {
        console.error('Session fetch error:', error);
        if (alive) setSess(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  return { sess, loading };
}
