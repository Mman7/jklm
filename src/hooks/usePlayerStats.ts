import { useEffect } from "react";
import useRoom from "../zustands/useRoomStore";
import { ablyUpdatePlayerStats } from "../library/client/ably_client";

export default function usePlayerStatsUpdater() {
  const { player } = useRoom();

  useEffect(() => {
    if (!player) return;
    // update player stats and send to notice other player
    ablyUpdatePlayerStats(player);
  }, [player]);
}
