"use client";

import useLoadingDialog from "../zustands/useLoadingStore";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Loading() {
  const { showLoading } = useLoadingDialog();
  return (
    <dialog id="my_modal_3" open={showLoading} className="modal">
      <div
        className={`modal-box flex aspect-square h-68 items-center justify-center overflow-hidden`}
      >
        <DotLottieReact
          src="/lotties/loading.lottie"
          className="aspect-square"
          loop
          autoplay
        />
      </div>
    </dialog>
  );
}
