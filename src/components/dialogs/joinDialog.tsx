"use client";

import { getRoom } from "@/src/library/client/client";
import { Room } from "@/src/types/room";
import useUserValid from "@/src/hooks/useUserValid";
import { useLoadingStore } from "@/src/zustands/useLoadingStore";
import { useRoomStore } from "@/src/zustands/useRoomStore";
import useDialogStore, {
  OpenDialogTypes,
  useDialogActions,
} from "@/src/zustands/useDialogStore";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import Dialog from "./dialog";

export default function JoinDialog() {
  const dialogType = useDialogStore((state) => state.dialog);
  const router = useRouter();
  const { isUserValid } = useUserValid();
  const setShowLoading = useLoadingStore((s) => s.setShowLoading);
  const setRoom = useRoomStore((s) => s.setRoom);
  const { closeDialog } = useDialogActions();
  const [dialogCode, setDialogCode] = useState("");
  const [showNotFound, setShowNotFound] = useState(false);

  const closeModal = () => {
    setShowNotFound(false);
    closeDialog();
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const nextCode = event.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setDialogCode(nextCode.toUpperCase().slice(0, 4));
    if (showNotFound) setShowNotFound(false);
  };

  const handleJoinRoom = async () => {
    if (!isUserValid) {
      closeDialog();
      return;
    }

    setShowLoading(true);

    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );

    try {
      const room: Room = await getRoom(dialogCode);
      setRoom(room);
      closeDialog();
      router.push(`/${room.id}`);
    } catch {
      setShowNotFound(true);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <Dialog
      open={dialogType === OpenDialogTypes.JoinDialogDialog}
      onClose={closeModal}
    >
      <div className="space-y-4">
        <h3 className="mb-3 text-xl font-bold">Join Room</h3>
        <input
          type="text"
          value={dialogCode}
          placeholder="Enter 4-character code"
          className="input border-base-content/20 bg-base-100/60 focus:border-primary focus:ring-primary/20 w-full rounded-xl border-2 text-center text-2xl font-bold tracking-widest uppercase backdrop-blur-xl transition-all focus:ring-2"
          maxLength={4}
          onChange={handleInput}
        />
        {showNotFound && (
          <p className="text-error text-sm font-medium">Room not found.</p>
        )}
        <button
          type="button"
          disabled={dialogCode.length !== 4}
          className="btn btn-block btn-primary rounded-xl"
          onClick={handleJoinRoom}
        >
          Join
        </button>
      </div>
    </Dialog>
  );
}
