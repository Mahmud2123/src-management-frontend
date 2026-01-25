import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchComplaints } from '@/lib/api';

interface UseComplaintsParams {
  status?: string;
  priority?: string;
  categoryId?: string;
  roleFilter?: 'ALL' | 'MINE';
  limit?: number;
}

// hooks/useComplaints.ts

export const useComplaints = (params: UseComplaintsParams) => {
  return useInfiniteQuery({
    // Adding params to queryKey ensures data refreshes when filters change
    queryKey: ['complaints', params], 
    initialPageParam: 1, 
    queryFn: ({ pageParam = 1 }) =>
      fetchComplaints({ 
        ...params, 
        page: pageParam as number 
      }),
    getNextPageParam: (lastPage) => {
      // Accessing the meta from your NestJS response
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    refetchOnWindowFocus: false,
  });
};

