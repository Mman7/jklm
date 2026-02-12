import { useEffect, useState } from "react";

export function useRoomPlayers(channel: any) {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (!channel) return;
    const updatePlayers = async () => {
      const members = await channel.presence.get();
      setPlayers(members.map((m: any) => m.data));
    };

    updatePlayers();

    channel.presence.subscribe("enter", updatePlayers);
    channel.presence.subscribe("leave", updatePlayers);

    return () => {
      channel.presence.unsubscribe();
    };
  }, [channel]);

  return players;
}
