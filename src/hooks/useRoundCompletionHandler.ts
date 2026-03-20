import { useEffect, useRef } from "react";
import { noticeServerNewQuestion } from "../library/client/client";
import { Player } from "../types/player";
import { QuestionHashOnly } from "../types/question";
import { useShowAnswerStore } from "../zustands/useShowAnswerStore";
import useGameController from "./useGameController";

const checkIsFirstPlayer = (players: Player[], playerId: string) => {
  // Deterministic host selection based on the lowest lexical playerId.
  if (players.length === 0) return false;
  const sortedPlayers = [...players].sort((a, b) =>
    a.playerId.localeCompare(b.playerId),
  );
  return sortedPlayers[0].playerId === playerId;
};

type UseRoundCompletionHandlerParams = {
  currentQuestionHash: QuestionHashOnly | null;
  hasJoinedGame: boolean;
  round: number;
  showAnswer: boolean;
  playerId: string;
  players: Player[];
  questionList: QuestionHashOnly[];
  roomId: string;
};

export default function useRoundCompletionHandler({
  currentQuestionHash,
  hasJoinedGame,
  round,
  showAnswer,
  playerId,
  players,
  questionList,
  roomId,
}: UseRoundCompletionHandlerParams) {
  const setShowAnswer = useShowAnswerStore((s) => s.setShowAnswer);
  const { handleGoToNextQuestion } = useGameController();
  // Prevent duplicate in-flight new-question requests.
  const isRequestingNewQuestionRef = useRef(false);
  // Guard key so the same round-completion transition triggers once.
  const lastTriggeredNewQuestionKeyRef = useRef<string | null>(null);
  const hasJoinedGameRef = useRef(hasJoinedGame);
  const playersRef = useRef(players);
  const roundRef = useRef(round);
  const roomIdRef = useRef(roomId);
  const handleGoToNextQuestionRef = useRef(handleGoToNextQuestion);
  const setShowAnswerRef = useRef(setShowAnswer);

  useEffect(() => {
    hasJoinedGameRef.current = hasJoinedGame;
  }, [hasJoinedGame]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    handleGoToNextQuestionRef.current = handleGoToNextQuestion;
  }, [handleGoToNextQuestion]);

  useEffect(() => {
    setShowAnswerRef.current = setShowAnswer;
  }, [setShowAnswer]);

  useEffect(() => {
    if (
      !showAnswer ||
      !currentQuestionHash?.hash ||
      questionList.length === 0
    ) {
      return;
    }

    const currentIndex = questionList.findIndex(
      (question) => question.hash === currentQuestionHash.hash,
    );

    if (currentIndex === -1) {
      return;
    }

    const isLastLoadedQuestion = currentIndex === questionList.length - 1;
    const roundKey = `${questionList[0]?.hash ?? "none"}:${currentQuestionHash.hash}`;

    const transitionTimerId = setTimeout(() => {
      if (!hasJoinedGameRef.current) {
        return;
      }

      if (!isLastLoadedQuestion) {
        setShowAnswerRef.current(false);
        handleGoToNextQuestionRef.current();
        return;
      }

      const isHost = checkIsFirstPlayer(playersRef.current, playerId);

      // Only the host triggers new question generation to avoid conflicts.
      if (
        !isHost ||
        isRequestingNewQuestionRef.current ||
        lastTriggeredNewQuestionKeyRef.current === roundKey
      ) {
        return;
      }

      // Host triggers next-round generation exactly once for this round key.
      isRequestingNewQuestionRef.current = true;
      lastTriggeredNewQuestionKeyRef.current = roundKey;

      // Notify server to advance to next question, which will broadcast new round data.
      noticeServerNewQuestion(roomIdRef.current, roundRef.current)
        .catch(() => {
          // Allow retry on failure by clearing dedupe key.
          lastTriggeredNewQuestionKeyRef.current = null;
        })
        .finally(() => {
          isRequestingNewQuestionRef.current = false;
        });
    }, 5000);

    return () => {
      clearTimeout(transitionTimerId);
    };
  }, [currentQuestionHash?.hash, playerId, questionList, showAnswer]);
}
