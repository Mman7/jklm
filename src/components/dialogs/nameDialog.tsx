"use client";

import Dialog from "./dialog";
import useNameDialog from "@/src/zustands/useNameDialogStore";
import { useEffect, useState } from "react";
import { generateNameWithUUID } from "@/src/library/client/client";
import useAuth from "@/src/zustands/useAuthStore";

export default function NameDialog() {
  const { setShowNameDialog, showNameDialog } = useNameDialog();
  const [inputValue, setInputValue] = useState<string>("");
  const { name, setName, setPlayerId } = useAuth();

  const handleSubmit = () => {
    setName(inputValue);
    setPlayerId(generateNameWithUUID(inputValue));
    setShowNameDialog(false);
  };

  const closeModal = () => {
    setShowNameDialog(false);
  };

  useEffect(() => {
    if (name !== "") setInputValue(name);
  }, [name]);

  return (
    <Dialog open={showNameDialog} onClose={() => closeModal()}>
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
