'use client';

import { useEffect, useState } from 'react';

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2000);
    return () => clearTimeout(t);
  }, [msg]);

  const Toast = () => msg ? (
    <div className="fixed bottom-4 right-4 rounded-lg bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
      {msg}
    </div>
  ) : null;

  return { setMsg, Toast };
}

