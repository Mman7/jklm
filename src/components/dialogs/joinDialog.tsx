"use client";

import React, { useState } from "react";

export default function JoinDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: () => void;
}) {
  const [input, setInput] = useState("");

  const handleInput = (e: any) => {
    const data = e.target.value.toUpperCase();
    setInput(data);
  };

  return (
    <>
      <dialog id="my_modal_2" open={open} className="modal">
        <div className="modal-box">
          <h3 className="mb-1 text-lg font-bold">Enter Code</h3>
          <input
            type="text"
            value={input}
            placeholder="Type here"
            className="input"
            maxLength={4}
            onChange={(e) => handleInput(e)}
          />
          <button
            disabled={input.length !== 4}
            className="btn btn-block btn-neutral my-4"
          >
            Join
          </button>
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button onClick={() => setOpen()} className="btn btn-block">
              Close
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setOpen()}>close</button>
        </form>
      </dialog>
    </>
  );
}
