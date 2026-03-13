"use client";

import { useEffect } from "react";
import { subscribeToMessages } from "../library/client/ably_client";
import { useRoomStore } from "../zustands/useRoomStore";

export function useLastChat() {
  const setLastChat = useRoomStore((s) => s.setLastChat);
  const lastChat = useRoomStore((s) => s.lastChat);
  const channel = useRoomStore((s) => s.channel);

  useEffect(() => {
    if (!channel) return;

    const unsubscribe = subscribeToMessages((msg) => {
      // update last chat
      setLastChat({ message: msg.text, senderId: msg.playerId });
    });

    return () => {
      unsubscribe?.();
    };
  }, [channel, setLastChat]);

  return { lastChat, setLastChat };
}
