// hooks/useStats.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchComplaintStats } from '../lib/api';
import { ComplaintStats } from '@/types';

export const useStats = () => {
  return useQuery<ComplaintStats, Error>({
    queryKey: ['complaintStats'],
    queryFn: fetchComplaintStats, // TypeScript now sees this returns Promise<ComplaintStats>
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });
};