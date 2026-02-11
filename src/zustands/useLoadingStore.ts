import { create } from "zustand";

interface LoadingStore {
  showLoading: boolean;
  setShowLoading: (showDialog: boolean) => void;
}

const useLoadingStore = create<LoadingStore>((set) => ({
  showLoading: false,
  setShowLoading: (showDialog: boolean) =>
    set(() => ({ showLoading: showDialog })),
}));

export default function useLoadingDialog() {
  const { showLoading, setShowLoading } = useLoadingStore();
  return { showLoading, setShowLoading };
}
