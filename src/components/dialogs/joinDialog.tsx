"use client";

import Dialog from "./dialog";

export default function JoinDialog({
  open,
  setClose,
  dialogCode,
  setDialogCode,
  callback,
}: {
  open: boolean;
  setClose: () => void;
  dialogCode: string;
  setDialogCode: (code: string) => void;
  callback: Function;
}) {
  const handleInput = (e: any) => {
    const data = e.target.value.toUpperCase();
    setDialogCode(data);
  };

  return (
    <Dialog open={open} onClose={() => setClose()}>
      <div className="space-y-4">
        <h3 className="mb-3 text-xl font-bold">Join Room</h3>
        <input
          type="text"
          value={dialogCode}
          placeholder="Enter 4-digit code"
          className="input border-base-content/20 bg-base-100/60 focus:border-primary focus:ring-primary/20 w-full rounded-xl border-2 text-center text-2xl font-bold tracking-widest uppercase backdrop-blur-xl transition-all focus:ring-2"
          maxLength={4}
          onChange={(e) => handleInput(e)}
        />
        <button
          disabled={dialogCode.length !== 4}
          className="btn btn-block btn-primary rounded-xl"
          onClick={() => callback()}
        >
          Join
        </button>
      </div>
    </Dialog>
  );
}
