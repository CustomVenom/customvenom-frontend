'use client';
import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { apiClient } from '@/lib/apiClient';

export function useAbortOnRouteChange(requests: Array<{ url: string; init?: RequestInit }>) {
  const pathname = usePathname();
  useEffect(() => {
    return () => {
      for (const r of requests) apiClient.abort(r.url, r.init);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}
