/** queryClient.ts — shared React Query client + query key factory. */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export const qk = {
  racks: ['racks'] as const,
  rackDetail: (id: number) => ['rack', id] as const,
  history: (params: Record<string, unknown>) => ['history', params] as const,
  historyItem: (id: number) => ['history-item', id] as const,
  summary: ['summary'] as const,
};

/** Invalidate everything that changes when a detection is created/deleted. */
export function invalidateAfterMutation() {
  queryClient.invalidateQueries({ queryKey: ['history'] });
  queryClient.invalidateQueries({ queryKey: ['rack'] });
  queryClient.invalidateQueries({ queryKey: qk.racks });
  queryClient.invalidateQueries({ queryKey: qk.summary });
}
