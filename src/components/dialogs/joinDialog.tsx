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
      <div>
        <h3 className="mb-1 text-lg font-bold">Join Room</h3>
        <input
          type="text"
          value={dialogCode}
          placeholder="Enter Code"
          className="input"
          maxLength={4}
          onChange={(e) => handleInput(e)}
        />
        <button
          disabled={dialogCode.length !== 4}
          className="btn btn-block btn-neutral my-4"
          onClick={() => callback()}
        >
          Join
        </button>
      </div>
    </Dialog>
  );
}
