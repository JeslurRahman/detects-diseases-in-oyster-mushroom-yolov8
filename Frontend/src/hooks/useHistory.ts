/** useHistory — infinite, filtered History list. */
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { fetchHistory, fetchHistoryItem } from '@/api/history.api';
import { qk } from '@/api/queryClient';
import { HISTORY_PAGE_SIZE } from '@/constants/config';
import type { HistoryQuery } from '@/types';

export function useHistory(query: HistoryQuery) {
  return useInfiniteQuery({
    queryKey: qk.history(query as Record<string, unknown>),
    queryFn: ({ pageParam }) => fetchHistory(pageParam, HISTORY_PAGE_SIZE, query),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.has_more ? last.page + 1 : undefined),
  });
}

export function useHistoryItem(id: number) {
  return useQuery({
    queryKey: qk.historyItem(id),
    queryFn: () => fetchHistoryItem(id),
  });
}
