/**
 * offlineQueue.ts — SCAFFOLDED offline support.
 *
 * v1 persists failed `saveBag` payloads so nothing is lost when the network
 * drops, and exposes a manual `flush`. Full automatic sync (NetInfo-triggered,
 * exponential backoff, conflict handling) is intentionally DEFERRED — see the
 * TODO in `startAutoSync`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { saveBag } from '@/api/prediction.api';
import { invalidateAfterMutation } from '@/api/queryClient';
import type { BagCreate } from '@/types';

const KEY = 'oyster.offlineQueue';

async function read(): Promise<BagCreate[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as BagCreate[]) : [];
}

async function write(items: BagCreate[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function enqueueBag(payload: BagCreate): Promise<void> {
  const items = await read();
  items.push(payload);
  await write(items);
}

export async function queueSize(): Promise<number> {
  return (await read()).length;
}

/** Attempt to send everything queued. Returns the number successfully synced. */
export async function flushQueue(): Promise<number> {
  const items = await read();
  if (!items.length) return 0;

  const remaining: BagCreate[] = [];
  let synced = 0;
  for (const item of items) {
    try {
      await saveBag(item);
      synced += 1;
    } catch {
      remaining.push(item);
    }
  }
  await write(remaining);
  if (synced) invalidateAfterMutation();
  return synced;
}

/**
 * TODO (deferred): subscribe to NetInfo and call flushQueue() automatically on
 * reconnect with backoff. Left as a stub so the wiring point is explicit.
 */
export function startAutoSync(): () => void {
  // const unsub = NetInfo.addEventListener((s) => { if (s.isConnected) flushQueue(); });
  // return unsub;
  return () => {};
}
