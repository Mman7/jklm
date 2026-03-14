"use client";

import Dialog from "./dialog";
import { useEffect, useState } from "react";
import { generateNameWithUUID } from "@/src/library/client/client";
import { useAuthStore } from "@/src/zustands/useAuthStore";
import useDialogStore, {
  OpenDialogTypes,
  useDialogActions,
} from "@/src/zustands/useDialogStore";

export default function NameDialog() {
  const [inputValue, setInputValue] = useState<string>("");
  const name = useAuthStore((s) => s.name);
  const setName = useAuthStore((s) => s.setName);
  const setPlayerId = useAuthStore((s) => s.setPlayerId);
  const { closeDialog } = useDialogActions();
  const dialogType = useDialogStore((state) => state.dialog);

  const handleSubmit = () => {
    setName(inputValue);
    setPlayerId(generateNameWithUUID(inputValue));

    closeDialog();
  };

  const closeModal = () => {
    closeDialog();
  };

  useEffect(() => {
    if (name !== "") setInputValue(name);
  }, [name]);

  return (
    <Dialog
      open={dialogType === OpenDialogTypes.NameDialog}
      onClose={() => closeModal()}
    >
      <div className="space-y-4">
        <h3 className="mb-3 text-xl font-bold">Enter Your Name</h3>
        <input
          type="text"
          value={inputValue}
          placeholder="Your name here..."
          className="input border-base-content/20 bg-base-100/60 focus:border-primary focus:ring-primary/20 w-full rounded-xl border-2 backdrop-blur-xl transition-all focus:ring-2"
          maxLength={12}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          disabled={inputValue?.length < 1}
          className="btn btn-block btn-primary rounded-xl"
          onClick={() => handleSubmit()}
        >
          Apply
        </button>
      </div>
    </Dialog>
  );
}
