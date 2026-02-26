import { useEffect, useState } from "react";
import Ably from "ably";
import { FetchedStatus, PlayerStatus } from "../types/enum/player_status";
import { Player } from "../types/player";

// * tracking players in room
export function useRoomPlayers(channel: Ably.RealtimeChannel | null) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAllPlayerCorrected, setIsAllPlayerCorrected] =
    useState<boolean>(false);
  const [isAllPlayerFetched, setIsAllPlayerFetched] = useState<boolean>(false);

  useEffect(() => {
    if (!channel) return;
    const updatePlayers = async () => {
      const members = await channel.presence.get();
      setPlayers(members.map((m) => m.data as Player));
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

  useEffect(() => {
    // check is all player answer correctly
    if (players.length === 0) {
      setIsAllPlayerCorrected(false);
      setIsAllPlayerFetched(false);
      return;
    }

    const allCorrected = players.every(
      (player) => player.playerStatus === PlayerStatus.answer_correct,
    );
    setIsAllPlayerCorrected(allCorrected);

    // check if all player status is ready
    const allReady = players.every(
      (player) => player.fetchedStatus === FetchedStatus.fetched,
    );
    setIsAllPlayerFetched(allReady);
  }, [players]);

  return { players, isAllPlayerCorrected, isAllPlayerFetched };
}
