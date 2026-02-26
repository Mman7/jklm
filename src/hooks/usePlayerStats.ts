import { useEffect } from "react";
import useRoom from "../zustands/useRoomStore";
import { ablyUpdatePlayerStats } from "../library/client/ably_client";

export default function usePlayerStatsUpdater(enabled: boolean) {
  const { player } = useRoom();

  useEffect(() => {
    if (!enabled || !player) return;
    // update player stats and send to notice other player
    ablyUpdatePlayerStats(player);
  }, [enabled, player]);
}
