import { create } from "zustand";

interface AppState {
  selectedGroup: string | null;
  selectedRound: string | null;
  setSelectedGroup: (group: string | null) => void;
  setSelectedRound: (round: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedGroup: null,
  selectedRound: null,
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  setSelectedRound: (round) => set({ selectedRound: round }),
}));
