"use client";

import useLoadingDialog from "../zustands/useLoadingStore";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Loading() {
  const { showLoading } = useLoadingDialog();
  return (
    <dialog
      id="my_modal_3"
      open={showLoading}
      className="modal backdrop-blur-sm"
    >
      <div
        className={`modal-box border-base-content/20 bg-base-100/95 flex aspect-square h-68 items-center justify-center overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl`}
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
