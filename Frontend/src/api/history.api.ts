/** history.api.ts — /history CRUD. */
import { api } from './api';
import {
  Detection,
  detectionSchema,
  HistoryPage,
  historyPageSchema,
  HistoryQuery,
} from '@/types';

export async function fetchHistory(
  page: number,
  pageSize: number,
  query: HistoryQuery = {},
): Promise<HistoryPage> {
  const { data } = await api.get('/history', {
    params: {
      page,
      page_size: pageSize,
      q: query.q || undefined,
      disease: query.disease || undefined,
      rack_id: query.rack_id || undefined,
      date_from: query.date_from || undefined,
      date_to: query.date_to || undefined,
    },
  });
  return historyPageSchema.parse(data);
}

export async function fetchHistoryItem(id: number): Promise<Detection> {
  const { data } = await api.get(`/history/${id}`);
  return detectionSchema.parse(data);
}

export async function deleteHistoryItem(id: number): Promise<void> {
  await api.delete(`/history/${id}`);
}
