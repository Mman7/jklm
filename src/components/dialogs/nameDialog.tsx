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
      <div>
        <h3 className="mb-1 text-lg font-bold">Enter Your Name</h3>
        <input
          type="text"
          value={inputValue}
          placeholder="Type here"
          className="input"
          maxLength={12}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          disabled={inputValue?.length < 1}
          className="btn btn-block btn-neutral my-4"
          onClick={() => handleSubmit()}
        >
          Apply
        </button>
      </div>
    </Dialog>
  );
}
