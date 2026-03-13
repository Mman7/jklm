import { create } from "zustand";

interface useNameDialogStore {
  showNameDialog: boolean;
  setShowNameDialog: (showDialog: boolean) => void;
}

export const useNameDialogStore = create<useNameDialogStore>((set) => ({
  showNameDialog: false,
  setShowNameDialog: (showDialog: boolean) =>
    set(() => ({ showNameDialog: showDialog })),
}));

export default useNameDialogStore;
