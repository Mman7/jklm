import { useEffect, useRef } from "react";
import useRoom from "../zustands/useRoomStore";
import { subscribeToEvents } from "../library/client/ably_client";
import { ServerEvent } from "../types/enum/server_events";
import { FetchedStatus, PlayerStatus } from "../types/enum/player_status";
import { Player } from "../types/player";
import { useRoomPlayers } from "./useRoomPlayers";
import useGameController from "./useGameController";
import useQuestion from "../zustands/useQuestionStore";
import { QuestionHashOnly } from "../types/question";
import useShowAnswer from "../zustands/useShowAnswerStore";
import { useParams, useRouter } from "next/navigation";

export default function useRoomEvent() {
  const router = useRouter();
  const params = useParams();
  const roomId = typeof params.id === "string" ? params.id : "";
  const { channel, updatePlayerStats, player } = useRoom();
  const { isAllPlayerCorrected, isAllPlayerFetched } = useRoomPlayers(channel);
  const { showPicture } = useGameController();
  const { setQuestionList, setCurrentQuestionHash, setCurrentQuestion } =
    useQuestion();
  const { setShowAnswer } = useShowAnswer();
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
            playerStatus: PlayerStatus.answer_correct,
            score: playerRef.current.score + 10, // example score increment
          };
          updatePlayerStats(newPlayerStat);
          break;

        case ServerEvent.NewQuestion:
          {
            const nextQuestionList = (
              event as { questionHash?: QuestionHashOnly[] }
            ).questionHash;

            if (!nextQuestionList || nextQuestionList.length === 0) break;

            setQuestionList(nextQuestionList);
            setCurrentQuestion(null);
            setCurrentQuestionHash(nextQuestionList[0] || null);
            setShowAnswer(false);

            if (!playerRef.current) break;

            const resetPlayerStat: Player = {
              ...playerRef.current,
              playerStatus: PlayerStatus.waiting,
              fetchedStatus: FetchedStatus.fetching,
            };

            updatePlayerStats(resetPlayerStat);
          }
          break;

        case ServerEvent.PlayerWinner:
          {
            const winnerPlayerId = (event as { playerId?: string }).playerId;
            if (!winnerPlayerId || !roomId) break;

            setShowAnswer(false);
            router.push(
              `/${roomId}/results?winner=${encodeURIComponent(winnerPlayerId)}`,
            );
          }
          break;

        default:
          break;
      }
      // Handle the event based on its type or content
    });

    return unsubscribe;
  }, [
    channel,
    roomId,
    router,
    setCurrentQuestion,
    setCurrentQuestionHash,
    setQuestionList,
    setShowAnswer,
    updatePlayerStats,
  ]);

  // Check if all players have answered correctly or fetched the question
  useEffect(() => {
    if (isAllPlayerCorrected && !prevAllCorrectedRef.current) {
      setShowAnswer(true);
    }

    prevAllCorrectedRef.current = isAllPlayerCorrected;
  }, [isAllPlayerCorrected, setShowAnswer]);

  // check is all player fetched the question, if yes show picture
  useEffect(() => {
    if (isAllPlayerFetched && !prevAllFetchedRef.current) {
      showPicture();
    }

    prevAllFetchedRef.current = isAllPlayerFetched;
  }, [isAllPlayerFetched, showPicture]);
}
