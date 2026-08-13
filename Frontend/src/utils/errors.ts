/** errors.ts — normalize any thrown value into a friendly, typed error. */
import axios from 'axios';

export interface AppError {
  message: string;
  kind: 'network' | 'timeout' | 'server' | 'validation' | 'notFound' | 'unknown';
  status?: number;
}

/**
 * Normalize FastAPI's `detail` into a plain string. It can be a string OR an
 * array of validation objects (`[{loc, msg, type}]`) on 422 — returning the
 * array would crash any component that renders it as text.
 */
function extractDetail(data: unknown): string | undefined {
  const detail = (data as { detail?: unknown } | undefined)?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) =>
        typeof d === 'string' ? d : (d as { msg?: string })?.msg ?? JSON.stringify(d),
      )
      .join(', ');
  }
  return undefined;
}

export function toAppError(err: unknown): AppError {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED') {
      return { kind: 'timeout', message: 'The request timed out. Please try again.' };
    }
    if (err.message === 'Network Error' || !err.response) {
      return {
        kind: 'network',
        message: 'Cannot reach the server. Check your connection and API URL.',
      };
    }
    const status = err.response.status;
    const detail = extractDetail(err.response.data);
    if (status === 404) {
      return { kind: 'notFound', status, message: detail ?? 'Not found.' };
    }
    if (status === 400 || status === 422) {
      return { kind: 'validation', status, message: detail ?? 'Invalid request.' };
    }
    return {
      kind: 'server',
      status,
      message: detail ?? `Server error (${status}). Please try again.`,
    };
  }
  if (err instanceof Error) return { kind: 'unknown', message: err.message };
  return { kind: 'unknown', message: 'Something went wrong.' };
}
