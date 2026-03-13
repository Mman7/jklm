import { create } from "zustand";

interface GameActions {
  setShowPicture: (show: boolean) => void;
  setTimer: (timer: number | null) => void;
  setGameReady: (ready: boolean) => void;
}

interface GameStore {
  showPicture: boolean;
  timer: number | null;
  gameReady: boolean;
  actions: GameActions;
}

export const useGameStore = create<GameStore>((set) => ({
  showPicture: false,
  timer: null,
  gameReady: false,
  actions: {
    setShowPicture: (show: boolean) => set({ showPicture: show }),
    setTimer: (timer: number | null) => set({ timer }),
    setGameReady: (ready: boolean) => set({ gameReady: ready }),
  },
}));

export function useGameActions() {
  return useGameStore((s) => s.actions);
}

export default useGameStore;
