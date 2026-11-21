import { create } from "zustand";
type UiState = { createTripOpen: boolean; setCreateTripOpen: (open: boolean) => void };
export const useUiStore = create<UiState>(set => ({ createTripOpen: false, setCreateTripOpen: open => set({ createTripOpen: open }) }));
