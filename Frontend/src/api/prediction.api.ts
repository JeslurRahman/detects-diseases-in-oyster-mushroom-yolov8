/** prediction.api.ts — /predict and /bag. */
import { Platform } from 'react-native';

import { api } from './api';
import { BagCreate, Detection, detectionSchema, PredictResponse, predictResponseSchema } from '@/types';

export interface PredictInput {
  uri: string;
  name?: string;
  type?: string;
}

/**
 * Upload an image (multipart) and get a detection result.
 *
 * Web and native build the multipart body differently:
 * - Web: the picker URI is a `data:`/`blob:` URL — fetch it into a real Blob and
 *   let the browser set the multipart boundary (do NOT set Content-Type manually).
 * - Native: use React Native's `{ uri, name, type }` file object + the
 *   transformRequest passthrough so RN sets the boundary.
 */
export async function predictImage(image: PredictInput): Promise<PredictResponse> {
  const form = new FormData();
  const name = image.name ?? 'capture.jpg';
  const type = image.type ?? 'image/jpeg';

  if (Platform.OS === 'web') {
    const blob = await (await fetch(image.uri)).blob();
    form.append('file', blob, name);
    const { data } = await api.post('/predict', form);
    return predictResponseSchema.parse(data);
  }

  form.append('file', { uri: image.uri, name, type } as unknown as Blob);
  const { data } = await api.post('/predict', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (d) => d, // let RN set the multipart boundary
  });
  return predictResponseSchema.parse(data);
}

/** Persist a detection after a successful prediction. */
export async function saveBag(payload: BagCreate): Promise<Detection> {
  const { data } = await api.post('/bag', payload);
  return detectionSchema.parse(data);
}
