/** report.api.ts — /reports/summary and export URLs. */
import { API_URL } from '@/constants/config';

import { api } from './api';
import { HistoryQuery, ReportSummary, reportSummarySchema } from '@/types';

export async function fetchSummary(): Promise<ReportSummary> {
  const { data } = await api.get('/reports/summary');
  return reportSummarySchema.parse(data);
}

function queryString(params: Record<string, string | number | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

/** Absolute URL for a single-record PDF (Detail screen). */
export function singlePdfUrl(id: number): string {
  return `${API_URL}/reports/pdf?id=${id}`;
}

/** Absolute URL for an aggregate PDF over the current History filters. */
export function summaryPdfUrl(query: HistoryQuery = {}): string {
  return `${API_URL}/reports/pdf${queryString({
    q: query.q,
    disease: query.disease,
    rack_id: query.rack_id,
    date_from: query.date_from,
    date_to: query.date_to,
  })}`;
}

export function excelUrl(query: HistoryQuery = {}): string {
  return `${API_URL}/reports/excel${queryString({
    q: query.q,
    disease: query.disease,
    rack_id: query.rack_id,
  })}`;
}
