import { useEffect } from "react";
import { useRoomStore } from "../zustands/useRoomStore";
import { ablyUpdatePlayerStats } from "../library/client/ably_client";

export default function usePlayerStatsUpdater(enabled: boolean) {
  const player = useRoomStore((s) => s.player);

  useEffect(() => {
    if (!enabled || !player) return;
    // update player stats and send to notice other player
    ablyUpdatePlayerStats(player);
  }, [enabled, player]);
}
