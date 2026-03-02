import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface CorrectProps {
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export default function Correct({
  onDismiss,
  autoDismissMs = 2000,
}: CorrectProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoDismissMs) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Centered content */}
      <div className="animate-in fade-in-0 zoom-in-95 relative z-10 flex flex-col items-center gap-4 duration-300">
        <DotLottieReact
          src="/lotties/success_confetti.lottie"
          className="aspect-square"
          autoplay
        />
      </div>
    </div>
  );
}
