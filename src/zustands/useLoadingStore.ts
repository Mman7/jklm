import { create } from "zustand";

interface LoadingStore {
  showLoading: boolean;
  setShowLoading: (showDialog: boolean) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  showLoading: false,
  setShowLoading: (showDialog: boolean) =>
    set(() => ({ showLoading: showDialog })),
}));

export default useLoadingStore;
