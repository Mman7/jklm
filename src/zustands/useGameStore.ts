import { create } from "zustand";

interface GameStore {
  showPicture: boolean;
  setShowPicture: (show: boolean) => void;
  timer: number | null;
  setTimer: (timer: number | null) => void;
  gameReady: boolean;
  setGameReady: (ready: boolean) => void;
}

const useGameStore = create<GameStore>((set) => ({
  showPicture: false,
  setShowPicture: (show: boolean) => set({ showPicture: show }),
  timer: null,
  setTimer: (timer: number | null) => set({ timer }),
  gameReady: false,
  setGameReady: (ready: boolean) => set({ gameReady: ready }),
}));

export default function useGame() {
  const {
    showPicture,
    setShowPicture,
    timer,
    setTimer,
    gameReady,
    setGameReady,
  } = useGameStore();

  return {
    showPicture,
    setShowPicture,
    timer,
    setTimer,
    gameReady,
    setGameReady,
  };
}
