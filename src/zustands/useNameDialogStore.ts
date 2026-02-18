import { create } from "zustand";

interface useNameDialogStore {
  showNameDialog: boolean;
  setShowNameDialog: (showDialog: boolean) => void;
}

const useNameDialogStore = create<useNameDialogStore>((set) => ({
  showNameDialog: false,
  setShowNameDialog: (showDialog: boolean) =>
    set(() => ({ showNameDialog: showDialog })),
}));

export default function useNameDialog() {
  const { showNameDialog, setShowNameDialog } = useNameDialogStore();
  return { showNameDialog, setShowNameDialog };
}
