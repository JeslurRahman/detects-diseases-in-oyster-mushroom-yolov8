/** useMutations — predict, saveBag, deleteHistory (with cache invalidation). */
import { useMutation } from '@tanstack/react-query';

import { deleteHistoryItem } from '@/api/history.api';
import { predictImage, PredictInput, saveBag } from '@/api/prediction.api';
import { invalidateAfterMutation } from '@/api/queryClient';
import type { BagCreate } from '@/types';

export function usePredict() {
  return useMutation({
    mutationFn: (image: PredictInput) => predictImage(image),
  });
}

export function useSaveBag() {
  return useMutation({
    mutationFn: (payload: BagCreate) => saveBag(payload),
    onSuccess: invalidateAfterMutation,
  });
}

export function useDeleteHistory() {
  return useMutation({
    mutationFn: (id: number) => deleteHistoryItem(id),
    onSuccess: invalidateAfterMutation,
  });
}
