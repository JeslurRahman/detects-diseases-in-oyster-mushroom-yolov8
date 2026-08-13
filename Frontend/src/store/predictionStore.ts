/**
 * predictionStore — the current Capture session (UI state only).
 * The prediction result itself is transient here; persisted records live in
 * React Query / the backend.
 */
import { create } from 'zustand';

import type { Detection, PredictResponse } from '@/types';

export interface PickedImage {
  uri: string;
  width?: number;
  height?: number;
  name?: string;
  mimeType?: string;
}

interface PredictionState {
  image: PickedImage | null;
  result: PredictResponse | null;
  saved: Detection | null;
  setImage: (image: PickedImage | null) => void;
  setResult: (result: PredictResponse | null) => void;
  setSaved: (saved: Detection | null) => void;
  reset: () => void;
}

export const usePredictionStore = create<PredictionState>((set) => ({
  image: null,
  result: null,
  saved: null,
  setImage: (image) => set({ image, result: null, saved: null }),
  setResult: (result) => set({ result }),
  setSaved: (saved) => set({ saved }),
  reset: () => set({ image: null, result: null, saved: null }),
}));
