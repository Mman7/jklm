import { useEffect, useState } from "react";
import Ably from "ably";
import { FetchedStatus, PlayerStatus } from "../types/enum/player_status";
import { Player } from "../types/player";

/**
 * Hook to manage real-time player data from an Ably channel.
 * Tracks player list, answer correctness, and fetch status.
 */
export function useRoomPlayers(channel: Ably.RealtimeChannel | null) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAllPlayerCorrected, setIsAllPlayerCorrected] =
    useState<boolean>(false);
  const [isAllPlayerFetched, setIsAllPlayerFetched] = useState<boolean>(false);

  // Subscribe to Ably presence changes and fetch initial players
  useEffect(() => {
    if (!channel) return;

    // Fetch current members from the channel
    const updatePlayers = async () => {
      const members = await channel.presence.get();
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

  // Update all-player status flags whenever the players list changes
  useEffect(() => {
    if (players.length === 0) {
      setIsAllPlayerCorrected(false);
      setIsAllPlayerFetched(false);
      return;
    }

    // Check if all players answered correctly
    const allCorrected = players.every(
      (player) => player.playerStatus === PlayerStatus.answer_correct,
    );
    setIsAllPlayerCorrected(allCorrected);

    // Check if all players have fetched data
    const allReady = players.every(
      (player) => player.fetchedStatus === FetchedStatus.fetched,
    );
    setIsAllPlayerFetched(allReady);
  }, [players]);

  return { players, isAllPlayerCorrected, isAllPlayerFetched };
}
