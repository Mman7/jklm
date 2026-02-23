import { useEffect, useState } from "react";
import Ably from "ably";

// * tracking players in room
export function useRoomPlayers(channel: Ably.RealtimeChannel | null) {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (!channel) return;
    const updatePlayers = async () => {
      const members = await channel.presence.get();
      //TODO fix player cant get updated when player update presence, maybe need to subscribe to presence update and get members again
      setPlayers(members.map((m: any) => m.data));
    };

    updatePlayers();

    // subscribe to presence changes
    channel.presence.subscribe("enter", updatePlayers);
    channel.presence.subscribe("update", updatePlayers);
    channel.presence.subscribe("leave", updatePlayers);

    return () => {
      channel.presence.unsubscribe("enter", updatePlayers);
      channel.presence.unsubscribe("update", updatePlayers);
      channel.presence.unsubscribe("leave", updatePlayers);
    };
  }, [channel]);

  return players;
}
