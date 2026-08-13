/**
 * api.ts — shared Axios instance.
 * Interceptors add timing/logging and normalize errors. An auth token slot is
 * wired but unused in v1 (no auth) — kept ready for a future AuthStore.
 */
import axios, { AxiosInstance } from 'axios';

import { API_URL, REQUEST_TIMEOUT_MS } from '@/constants/config';

let authToken: string | null = null;

/** Future-proofing: call this once auth exists. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Re-throw; callers normalize with toAppError. Central place for logging.
    if (__DEV__ && error?.config) {
      // eslint-disable-next-line no-console
      console.warn(
        `[api] ${error.config.method?.toUpperCase()} ${error.config.url} → ${
          error.response?.status ?? error.code ?? 'ERR'
        }`,
      );
    }
    return Promise.reject(error);
  },
);
