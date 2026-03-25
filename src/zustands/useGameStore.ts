import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface GameActions {
  setShowPicture: (show: boolean) => void;
  setTimer: (timer: number | null) => void;
  setGameReady: (ready: boolean) => void;
  setRound: (round: number) => void;
  incRound: () => void;
  setDevToolsOpen: (open: boolean) => void;
  toggleDevTools: () => void;
}

interface GameStore {
  showPicture: boolean;
  timer: number | null;
  gameReady: boolean;
  round: number;
  devToolsOpen: boolean;
  actions: GameActions;
}
export const useGameStore = create<GameStore>()(
  devtools(
    (set) => ({
      showPicture: false,
      timer: null,
      gameReady: false,
      round: 1,
      devToolsOpen: false,
      actions: {
        setShowPicture: (show: boolean) => set({ showPicture: show }),
        setTimer: (timer: number | null) => set({ timer }),
        setGameReady: (ready: boolean) => set({ gameReady: ready }),
        setRound: (round: number) => set({ round }),
        incRound: () =>
          set((state) => ({
            round: state.round + 1,
          })),
        setDevToolsOpen: (open: boolean) => set({ devToolsOpen: open }),
        toggleDevTools: () =>
          set((state) => ({ devToolsOpen: !state.devToolsOpen })),
      },
    }),
    { name: "jklm-game" },
  ),
);

export function useGameActions() {
  return useGameStore((s) => s.actions);
}

export default useGameStore;
