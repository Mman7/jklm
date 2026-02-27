"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { leaveRoom } from "@/src/library/client/ably_client";

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
      void leaveRoom();
      void fetch(`/api/room/${roomId}`, {
        method: "DELETE",
      });
      router.replace("/");
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [delayMs, roomId, router]);

  return null;
}
