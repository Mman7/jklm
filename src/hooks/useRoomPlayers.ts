import { useEffect, useMemo, useRef, useState } from "react";
import Ably from "ably";
import { FetchedStatus, PlayerStatus } from "../types/enum/player_status";
import { Player } from "../types/player";

/**
 * Hook to manage real-time player data from an Ably channel.
 * Tracks player list, answer correctness, and fetch status.
 */
export function useRoomPlayers(channel: Ably.RealtimeChannel | null) {
  const [players, setPlayers] = useState<Player[]>([]);
  const presenceFetchVersionRef = useRef(0);

  // Subscribe to Ably presence changes and fetch initial players
  useEffect(() => {
    if (!channel) return;

    // Fetch current members from the channel
    const updatePlayers = async () => {
      const fetchVersion = ++presenceFetchVersionRef.current;
      const members = await channel.presence.get();
      if (fetchVersion !== presenceFetchVersionRef.current) return;
      setPlayers(members.map((m) => m.data as Player));
    };

    updatePlayers();

    // Subscribe to presence events: when players enter, update, or leave
    channel.presence.subscribe("enter", updatePlayers);
    channel.presence.subscribe("update", updatePlayers);
    channel.presence.subscribe("leave", updatePlayers);

    // Cleanup subscriptions on unmount or channel change
    return () => {
      channel.presence.unsubscribe("enter", updatePlayers);
      channel.presence.unsubscribe("update", updatePlayers);
      channel.presence.unsubscribe("leave", updatePlayers);
    };
  }, [channel]);

  const isAllPlayerCorrected = useMemo(
    () =>
      players.length > 0 &&
      players.every(
        (player) => player.playerStatus === PlayerStatus.answer_correct,
      ),
    [players],
  );

  const isAllPlayerFetched = useMemo(
    () =>
      players.length > 0 &&
      players.every((player) => player.fetchedStatus === FetchedStatus.fetched),
    [players],
  );

  return { players, isAllPlayerCorrected, isAllPlayerFetched };
}
