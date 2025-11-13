'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // 5 minutes auto-refresh
      refetchOnWindowFocus: true, // Refetch when user returns
      retry: 1, // Don't hammer API
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
