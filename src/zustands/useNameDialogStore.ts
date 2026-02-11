import { create } from "zustand";

interface useNameDialogStore {
  showDialog: boolean;
  setShowDialog: (showDialog: boolean) => void;
}

const useNameDialogStore = create<useNameDialogStore>((set) => ({
  showDialog: false,
  setShowDialog: (showDialog: boolean) => set(() => ({ showDialog })),
}));

export default function useNameDialog() {
  const { showDialog, setShowDialog } = useNameDialogStore();
  return { showDialog, setShowDialog };
}
