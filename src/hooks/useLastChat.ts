"use client";

import { useEffect } from "react";
import { subscribeToMessages } from "../library/client/ably_client";
import useRoom from "../zustands/useRoomStore";

export function useLastChat() {
  const { setLastChat, lastChat, channel } = useRoom();
  useEffect(() => {
    if (!channel) return;
    subscribeToMessages((msg) => {
      // update last chat
      console.log(msg);
      setLastChat({ message: msg.text, senderId: msg.playerId });
    });
  }, [channel]);

  return { lastChat };
}
