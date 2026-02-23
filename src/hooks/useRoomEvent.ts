import { useEffect } from "react";
import useRoom from "../zustands/useRoomStore";
import {
  ablyUpdatePlayerStats,
  subscribeToEvents,
} from "../library/client/ably_client";
import { ServerEvent } from "../types/enum/server_events";

export default function useRoomEvent() {
  const { channel, updatePlayerStats, player } = useRoom();

  useEffect(() => {
    if (!channel) return;
    subscribeToEvents((event) => {
      // Only handle events related to the current player
      if (event.playerId !== player?.playerId) return;
      switch (event.text) {
        case ServerEvent.PlayerAnsweredCorrectly:
          if (!player) return;
          const newPlayerStat = {
            ...player,
            score: player.score + 10, // example score increment
          };
          updatePlayerStats(newPlayerStat);
          ablyUpdatePlayerStats(newPlayerStat);
          break;

        default:
          break;
      }
      // Handle the event based on its type or content
    });
  }, [channel, player]);
}
