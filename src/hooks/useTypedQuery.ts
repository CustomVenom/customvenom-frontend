import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ApiResponse } from '@/types/api';

export function useTypedQuery<T>(
  options: UseQueryOptions<ApiResponse<T>>,
): UseQueryResult<ApiResponse<T>> {
  return useQuery(options) as UseQueryResult<ApiResponse<T>>;
}
