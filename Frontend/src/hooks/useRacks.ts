/** useRacks / useRackDetail — Tracking data. */
import { useQuery } from '@tanstack/react-query';

import { fetchRackDetail, fetchRacks } from '@/api/rack.api';
import { qk } from '@/api/queryClient';

export function useRacks() {
  return useQuery({ queryKey: qk.racks, queryFn: fetchRacks });
}

export function useRackDetail(rackId: number | null) {
  return useQuery({
    queryKey: rackId ? qk.rackDetail(rackId) : ['rack', 'none'],
    queryFn: () => fetchRackDetail(rackId as number),
    enabled: rackId != null,
  });
}
