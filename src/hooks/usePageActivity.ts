import { useEffect, useRef } from "react";

type UsePageActivityParams = {
  onBecameActive?: () => void;
};

// Custom hook to track page visibility and trigger a callback when the page becomes active.
export default function usePageActivity({
  onBecameActive,
}: UsePageActivityParams = {}) {
  const isPageActiveRef = useRef(true);
  const onBecameActiveRef = useRef(onBecameActive);

  useEffect(() => {
    onBecameActiveRef.current = onBecameActive;
  }, [onBecameActive]);

  useEffect(() => {
    const computeIsPageActive = () => {
      if (typeof document === "undefined") return true;
      return document.visibilityState === "visible";
    };

    const updatePageActive = () => {
      const wasActive = isPageActiveRef.current;
      const isActive = computeIsPageActive();
      isPageActiveRef.current = isActive;

      if (!wasActive && isActive) {
        onBecameActiveRef.current?.();
      }
    };

    updatePageActive();

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", updatePageActive);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", updatePageActive);
      }
    };
  }, []);

  return isPageActiveRef;
}
