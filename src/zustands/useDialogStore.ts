import { create } from "zustand";

export enum OpenDialogTypes {
  None = "None",
  GameSettingsDialog = "GameSettings",
  PlayerChatDialog = "PlayerChat",
  JoinDialogDialog = "Join",
  NameDialog = "Name",
}

interface DialogStore {
  dialog: OpenDialogTypes;
  actions: {
    openDialog: (dialog: OpenDialogTypes) => void;
    closeDialog: () => void;
  };
}

export const useDialogStore = create<DialogStore>((set) => ({
  dialog: OpenDialogTypes.None,
  actions: {
    openDialog: (dialog: OpenDialogTypes) => set({ dialog }),
    closeDialog: () => set({ dialog: OpenDialogTypes.None }),
  },
}));

export const useDialogActions = () => useDialogStore((state) => state.actions);

export default useDialogStore;
