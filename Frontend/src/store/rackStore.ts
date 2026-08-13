/** rackStore — the rack currently selected on the Tracking screen. */
import { create } from 'zustand';

interface RackState {
  selectedRackId: number | null;
  setSelectedRack: (id: number | null) => void;
}

export const useRackStore = create<RackState>((set) => ({
  selectedRackId: null,
  setSelectedRack: (id) => set({ selectedRackId: id }),
}));
