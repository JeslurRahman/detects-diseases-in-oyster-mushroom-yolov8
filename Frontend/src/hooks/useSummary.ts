/** useSummary — aggregate report counts. */
import { useQuery } from '@tanstack/react-query';

import { fetchSummary } from '@/api/report.api';
import { qk } from '@/api/queryClient';

export function useSummary() {
  return useQuery({ queryKey: qk.summary, queryFn: fetchSummary });
}
