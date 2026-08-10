// hooks/useComplaints.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchComplaints } from '@/lib/api';

interface UseComplaintsParams {
  status?: string;
  priority?: string;
  categoryId?: string;
  roleFilter?: 'ALL' | 'MINE';
  limit?: number;
  search?: string;
}

export const useComplaints = (params: UseComplaintsParams) => {
  return useInfiniteQuery({
    queryKey: ['complaints', params],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      fetchComplaints({
        ...params,
        page: pageParam as number,
      }),
    getNextPageParam: (lastPage) => {
      // Defensive check - ensure lastPage and meta exist
      if (!lastPage || typeof lastPage !== 'object') {
        return undefined;
      }

      // Try to get meta from different possible locations
      const meta = lastPage.meta || lastPage._meta || lastPage.pagination || lastPage;
      
      // If meta doesn't exist or doesn't have page/totalPages, return undefined
      if (!meta || typeof meta !== 'object') {
        return undefined;
      }

      const page = meta.page ?? 1;
      const totalPages = meta.totalPages ?? meta.pages ?? 1;

      // Ensure we have valid numbers
      if (typeof page !== 'number' || typeof totalPages !== 'number') {
        return undefined;
      }

      return page < totalPages ? page + 1 : undefined;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });
};