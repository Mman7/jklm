"use client";

import useDialogStore, {
  OpenDialogTypes,
  useDialogActions,
} from "@/src/zustands/useDialogStore";
import SidebarContent from "../SidebarContent";

export default function GameSettingsDialog() {
  const { closeDialog } = useDialogActions();
  const dialog = useDialogStore((state) => state.dialog);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${dialog === OpenDialogTypes.GameSettingsDialog ? "" : "pointer-events-none hidden"}`}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="bg-base-content/40 absolute inset-0"
        onClick={() => closeDialog()}
        aria-label="Close game settings"
      />
      <div className="absolute top-0 left-0 h-full w-[min(22rem,92vw)] p-2">
        <SidebarContent className="rounded-2xl" />
      </div>
    </div>
  );
}
