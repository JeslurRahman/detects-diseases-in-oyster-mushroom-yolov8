/** config.ts — runtime configuration. */
import Constants from 'expo-constants';

/**
 * Resolve the API base URL. Priority:
 *  1. EXPO_PUBLIC_API_URL env var (recommended — set in .env)
 *  2. app.json `extra.apiUrl`
 *  3. localhost fallback
 *
 * NOTE: physical devices cannot reach `localhost`; use your machine's LAN IP.
 */
const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;

export const API_URL = (fromEnv || fromExtra || 'http://localhost:8000').replace(
  /\/+$/,
  '',
);

export const REQUEST_TIMEOUT_MS = 30000;
export const HISTORY_PAGE_SIZE = 15;
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB

/** Turn a relative `/outputs/<file>` path from the API into an absolute URL. */
export function absoluteImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
