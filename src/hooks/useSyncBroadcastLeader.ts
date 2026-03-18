import { useEffect, useState } from "react";
import Ably from "ably";
import { Player } from "../types/player";
import { isLeaderPlayerId } from "../utils/leader_election";

type UseSyncBroadcastLeaderParams = {
  channel: Ably.RealtimeChannel | null;
  mounted: boolean;
  playerId: string;
};

export default function useSyncBroadcastLeader({
  channel,
  mounted,
  playerId,
}: UseSyncBroadcastLeaderParams) {
  const [isBroadcastLeader, setIsBroadcastLeader] = useState(false);

  useEffect(() => {
    if (!mounted || !channel || !playerId) {
      setIsBroadcastLeader(false);
      return;
    }

    let isDisposed = false;

    const refreshLeader = async () => {
      try {
        const members = await channel.presence.get();
        if (isDisposed) return;

        const sortedIds = members
          .map((member) => (member.data as Partial<Player>)?.playerId)
          .filter((memberPlayerId): memberPlayerId is string =>
            Boolean(memberPlayerId),
          );

        setIsBroadcastLeader(isLeaderPlayerId(playerId, sortedIds));
      } catch {
        // If leader cannot be resolved, fail closed to avoid competing broadcasts.
        setIsBroadcastLeader(false);
      }
    };

    void refreshLeader();

    const onPresenceChanged = () => {
      void refreshLeader();
    };

    channel.presence.subscribe("enter", onPresenceChanged);
    channel.presence.subscribe("leave", onPresenceChanged);
    channel.presence.subscribe("update", onPresenceChanged);

    return () => {
      isDisposed = true;
      setIsBroadcastLeader(false);
      channel.presence.unsubscribe("enter", onPresenceChanged);
      channel.presence.unsubscribe("leave", onPresenceChanged);
      channel.presence.unsubscribe("update", onPresenceChanged);
    };
  }, [channel, mounted, playerId]);

  return isBroadcastLeader;
}
