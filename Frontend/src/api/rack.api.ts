/** rack.api.ts — /racks and /rack/{id}. */
import { api } from './api';
import { Rack, RackDetail, rackDetailSchema, racksSchema } from '@/types';

export async function fetchRacks(): Promise<Rack[]> {
  const { data } = await api.get('/racks');
  return racksSchema.parse(data);
}

export async function fetchRackDetail(rackId: number): Promise<RackDetail> {
  const { data } = await api.get(`/rack/${rackId}`);
  return rackDetailSchema.parse(data);
}
