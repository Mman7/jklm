import { useEffect, useRef } from "react";
import Ably from "ably";
import { Player } from "../types/player";

type UseJoinSyncParams = {
  channel: Ably.RealtimeChannel | null;
  player: Player | null;
  hasJoinedGame: boolean;
  sendReqSync: () => void;
};

export default function useJoinSync({
  channel,
  player,
  hasJoinedGame,
  sendReqSync,
}: UseJoinSyncParams) {
  const hasRequestedSyncRef = useRef(false);

  useEffect(() => {
    if (!hasJoinedGame) {
      hasRequestedSyncRef.current = false;
    }
  }, [hasJoinedGame]);

  useEffect(() => {
    if (!channel || !player || !hasJoinedGame || hasRequestedSyncRef.current)
      return;
    hasRequestedSyncRef.current = true;
    sendReqSync();
  }, [channel, hasJoinedGame, player, sendReqSync]);
}
