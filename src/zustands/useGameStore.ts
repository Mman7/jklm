import { create } from "zustand";

interface GameActions {
  setShowPicture: (show: boolean) => void;
  setTimer: (timer: number | null) => void;
  setGameReady: (ready: boolean) => void;
  setRound: (round: number) => void;
  incRound: () => void;
}

interface GameStore {
  showPicture: boolean;
  timer: number | null;
  gameReady: boolean;
  round: number;
  actions: GameActions;
}

export const useGameStore = create<GameStore>((set) => ({
  showPicture: false,
  timer: null,
  gameReady: false,
  round: 1,
  actions: {
    setShowPicture: (show: boolean) => set({ showPicture: show }),
    setTimer: (timer: number | null) => set({ timer }),
    setGameReady: (ready: boolean) => set({ gameReady: ready }),
    setRound: (round: number) => set({ round }),
    incRound: () =>
      set((state) => ({
        round: state.round + 1,
      })),
  },
}));

export function useGameActions() {
  return useGameStore((s) => s.actions);
}

export default useGameStore;
