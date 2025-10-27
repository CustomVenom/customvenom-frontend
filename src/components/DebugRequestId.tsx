'use client';

import { useEffect, useState } from 'react';

export default function DebugRequestId() {
  const [rid, setRid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] as string;
      const res = await fetch(`${API_BASE}/api/health`, { cache: 'no-store' });
      setRid(res.headers.get('x-request-id'));
    })();
  }, []);

  if (!rid) return null;

  return (
    <div className="fixed bottom-2 right-2 rounded bg-zinc-800/80 text-zinc-100 px-2 py-1 text-[10px]">
      req:{rid.slice(0, 8)}
    </div>
  );
}
