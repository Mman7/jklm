import { useEffect, useRef } from "react";
import useRoom from "../zustands/useRoomStore";
import { subscribeToEvents } from "../library/client/ably_client";
import { ServerEvent } from "../types/enum/server_events";
import { PlayerStatus } from "../types/enum/player_status";
import { Player } from "../types/player";
import { useRoomPlayers } from "./useRoomPlayers";
import useGameController from "./useGameController";

export default function useRoomEvent() {
  const { channel, updatePlayerStats, player } = useRoom();
  const { isAllPlayerCorrected, isAllPlayerFetched } = useRoomPlayers(channel);
  const { handleGoToNextQuestion, showPicture } = useGameController();
  const playerRef = useRef(player);
  const prevAllCorrectedRef = useRef(false);
  const prevAllFetchedRef = useRef(false);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    if (!channel) return;

    //TODO add new event fetch more new question
    const unsubscribe = subscribeToEvents((event) => {
      // Only handle events related to the current player
      switch (event.text) {
        case ServerEvent.PlayerAnsweredCorrectly:
          if (event.playerId !== playerRef.current?.playerId) return;
          if (!playerRef.current) return;
          const newPlayerStat: Player = {
            ...playerRef.current,
            status: PlayerStatus.answer_correct,
            score: playerRef.current.score + 10, // example score increment
          };
          updatePlayerStats(newPlayerStat);
          break;

        case ServerEvent.newQuestion:
          // TODO trigger when new question is fetched, update player status to not_answered and show question

          console.log(event);
          break;

        default:
          break;
      }
      // Handle the event based on its type or content
    });

    return unsubscribe;
  }, [channel, updatePlayerStats]);

  // Check if all players have answered correctly or fetched the question
  useEffect(() => {
    if (isAllPlayerCorrected && !prevAllCorrectedRef.current) {
      handleGoToNextQuestion();
    }

    prevAllCorrectedRef.current = isAllPlayerCorrected;
  }, [handleGoToNextQuestion, isAllPlayerCorrected]);

  // check is all player fetched the question, if yes show picture
  useEffect(() => {
    if (isAllPlayerFetched && !prevAllFetchedRef.current) {
      showPicture();
    }

    prevAllFetchedRef.current = isAllPlayerFetched;
  }, [isAllPlayerFetched, showPicture]);
}
