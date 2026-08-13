/** historyStore — History screen filter/search UI state. */
import { create } from 'zustand';

import type { DiseaseKey } from '@/types';

export type DiseaseFilter = DiseaseKey | 'all';

interface HistoryState {
  filter: DiseaseFilter;
  search: string;
  setFilter: (filter: DiseaseFilter) => void;
  setSearch: (search: string) => void;
  reset: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  filter: 'all',
  search: '',
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  reset: () => set({ filter: 'all', search: '' }),
}));
