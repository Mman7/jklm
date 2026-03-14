import PlayerListChat from "../game/PlayerListChat";
import useDialogStore, {
  OpenDialogTypes,
  useDialogActions,
} from "@/src/zustands/useDialogStore";
import { X } from "lucide-react";

export default function PlayerChatDialog() {
  const { closeDialog } = useDialogActions();
  const dialog = useDialogStore((state) => state.dialog);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${dialog === OpenDialogTypes.PlayerChatDialog ? "" : "pointer-events-none hidden"}`}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="bg-base-content/40 absolute inset-0"
        onClick={() => closeDialog()}
        aria-label="Close player list"
      />
      <div className="absolute top-0 right-0 h-full w-[min(22rem,92vw)] p-2">
        <PlayerListChat
          className="h-full w-full"
          headerAction={
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => closeDialog()}
              aria-label="Close player list"
            >
              <X size={14} />
            </button>
          }
        />
      </div>
    </div>
  );
}
