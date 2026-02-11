"use client";

import useGame from "@/src/zustands/useGameStore";
import Dialog from "./dialog";
import useNameDialog from "@/src/zustands/useNameDialogStore";
import { useEffect, useState } from "react";
import useUserValid from "@/src/hooks/useUserValid";
import { TokenRequest } from "ably";
import useAuth from "@/src/zustands/useAuthStore";

export default function NameDialog() {
  const { setShowDialog, showDialog } = useNameDialog();
  const [inputValue, setInputValue] = useState<string>("");
  const { isUserHasToken } = useUserValid();
  const { setToken } = useAuth();
  const { name, setName } = useGame();

  const handleSubmit = () => {
    setName(inputValue);
    // Check if the user already has a token, if not, generate one
    if (!isUserHasToken) {
      fetch("/api/ably-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputValue }),
      }).then((res) =>
        res.json().then((data: TokenRequest) => {
          setToken(data);
        }),
      );
    }

    setShowDialog(false);
  };

  const closeModal = () => {
    setShowDialog(false);
  };

  useEffect(() => {
    if (name !== "") {
      setInputValue(name);
    }
  }, [name]);

  return (
    <Dialog open={showDialog} onClose={() => closeModal()}>
      <div>
        <h3 className="mb-1 text-lg font-bold">Enter Your Name</h3>
        <input
          type="text"
          value={inputValue}
          placeholder="Type here"
          className="input"
          maxLength={4}
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
