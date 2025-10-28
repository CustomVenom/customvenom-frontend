'use client';
import { makeApi } from '@/lib/apiClient';
import { useQuery } from '@tanstack/react-query';

export function useHealth() {
  const api = makeApi(process.env['NEXT_PUBLIC_API_BASE']!);
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.healthGet();
      return res;
    },
    staleTime: 60_000,
  });
}
