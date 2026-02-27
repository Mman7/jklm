"use client";

import React from "react";

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
}

export default function Dialog({
  children,
  open,
  onClose,
  className,
}: DialogProps) {
  return (
    <dialog id="my_modal_2" open={open} className="modal backdrop-blur-sm">
      <div
        className={`${className} modal-box border-base-content/20 bg-base-100/95 rounded-3xl border shadow-2xl backdrop-blur-xl`}
      >
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button
            onClick={() => onClose()}
            className="btn btn-sm btn-circle btn-ghost hover:bg-base-content/10 absolute top-2 right-2"
          >
            ✕
          </button>
        </form>
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => onClose()}>close</button>
      </form>
    </dialog>
  );
}
