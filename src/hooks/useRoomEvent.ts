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
  // Room id is sourced from dynamic route segment.
  const roomId = typeof params.id === "string" ? params.id : "";
  const { channel, updatePlayerStats, player } = useRoom();
  const { isAllPlayerCorrected, isAllPlayerFetched, players } =
    useRoomPlayers(channel);
  const { showPicture } = useGameController();
  const {
    setQuestionList,
    setCurrentQuestionHash,
    setCurrentQuestion,
    currentQuestionHash,
  } = useQuestion();
  const { setShowAnswer } = useShowAnswer();
  // Keep latest player object for subscription callbacks.
  const playerRef = useRef(player);
  // Edge-detection refs to avoid repeating one-time UI actions.
  const prevAllCorrectedRef = useRef(false);
  const prevAllFetchedRef = useRef(false);
  // Becomes true once at least one player has entered fetching state.
  const seenFetchingForQuestionRef = useRef(false);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    // Reset per-question progression flags when question changes.
    seenFetchingForQuestionRef.current = false;
    prevAllCorrectedRef.current = false;
    prevAllFetchedRef.current = false;
  }, [currentQuestionHash?.hash]);

  useEffect(() => {
    // Mark that this question lifecycle has started fetching.
    if (
      players.some(
        (roomPlayer) => roomPlayer.fetchedStatus === FetchedStatus.fetching,
      )
    ) {
      seenFetchingForQuestionRef.current = true;
    }
  }, [players]);

  useEffect(() => {
    if (!channel) return;

    const unsubscribe = subscribeToEvents((event) => {
      // Handle room-level events and update local stores accordingly.
      switch (event.text) {
        case ServerEvent.PlayerAnsweredCorrectly:
          // Only the targeted player's status should be marked correct locally.
          if (event.playerId !== playerRef.current?.playerId) return;
          if (!playerRef.current) return;
          const newPlayerStat: Player = {
            ...playerRef.current,
            playerStatus: PlayerStatus.answer_correct,
          };
          updatePlayerStats(newPlayerStat);
          break;

        case ServerEvent.NewQuestion:
          {
            // Server sends next round list; use first item as active question.
            const nextQuestionList = (
              event as { questionHash?: QuestionHashOnly[] }
            ).questionHash;

            if (!nextQuestionList || nextQuestionList.length === 0) break;

            setQuestionList(nextQuestionList);
            setCurrentQuestion(null);
            setCurrentQuestionHash(nextQuestionList[0] || null);
            setShowAnswer(false);

            if (!playerRef.current) break;

            // Reset local player state for the newly started question.
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
            // Navigate to results screen with winner encoded in query params.
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

  // Show answer panel exactly once when everyone is fetched and correct.
  useEffect(() => {
    if (
      seenFetchingForQuestionRef.current &&
      isAllPlayerFetched &&
      isAllPlayerCorrected &&
      !prevAllCorrectedRef.current
    ) {
      setShowAnswer(true);
    }

    prevAllCorrectedRef.current = isAllPlayerCorrected;
  }, [isAllPlayerCorrected, isAllPlayerFetched, setShowAnswer]);

  // Reveal picture once when all players finish fetching.
  useEffect(() => {
    if (isAllPlayerFetched && !prevAllFetchedRef.current) {
      showPicture();
    }

    prevAllFetchedRef.current = isAllPlayerFetched;
  }, [isAllPlayerFetched, showPicture]);
}
