"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ResultsAutoRedirectProps {
  roomId: string;
  delayMs?: number;
}

export default function ResultsAutoRedirect({
  roomId,
  delayMs = 5000,
}: ResultsAutoRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace(`/${roomId}`);
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [delayMs, roomId, router]);

  return null;
}
