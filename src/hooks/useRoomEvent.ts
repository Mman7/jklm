import { useEffect } from "react";
import useRoom from "../zustands/useRoomStore";
import { sendSyncData, subscribeToEvents } from "../library/client/ably_client";
import { ServerEvent } from "../types/enum/server_events";
import { PlayerStatus } from "../types/enum/player_status";
import { Player } from "../types/player";
import { useRoomPlayers } from "./useRoomPlayers";
import useGameController from "./useGameController";
import { SyncData } from "../types/sync_data";
import useGame from "../zustands/useGameStore";

export default function useRoomEvent() {
  const { channel, updatePlayerStats, player } = useRoom();
  const { isAllPlayerCorrected, isAllPlayerFetched } = useRoomPlayers(channel);
  const { handleGoToNextQuestion, showPicture } = useGameController();

  useEffect(() => {
    if (!channel) return;
    subscribeToEvents((event) => {
      // Only handle events related to the current player
      if (event.playerId !== player?.playerId) return;
      switch (event.text) {
        case ServerEvent.PlayerAnsweredCorrectly:
          if (!player) return;
          const newPlayerStat: Player = {
            ...player,
            status: PlayerStatus.answer_correct,
            score: player.score + 10, // example score increment
          };
          updatePlayerStats(newPlayerStat);
          break;

        default:
          break;
      }
      // Handle the event based on its type or content
    });
  }, [channel, player]);

  useEffect(() => {
    if (isAllPlayerCorrected) {
      handleGoToNextQuestion();
    }
  }, [isAllPlayerCorrected]);

  useEffect(() => {
    if (isAllPlayerFetched) {
      showPicture();
    }
  }, [isAllPlayerFetched]);
  // sync player status and timer to all players every 5 seconds
}
