import { useEffect, useRef } from "react";
import { noticeServerNewQuestion } from "../library/client/client";
import { Player } from "../types/player";
import { QuestionHashOnly } from "../types/question";

const checkIsFirstPlayer = (players: Player[], playerId: string) => {
  if (players.length === 0) return false;
  const sortedPlayers = [...players].sort((a, b) =>
    a.playerId.localeCompare(b.playerId),
  );
  return sortedPlayers[0].playerId === playerId;
};

type UseRoundCompletionHandlerParams = {
  currentQuestionHash: QuestionHashOnly | null;
  hasJoinedGame: boolean;
  showAnswer: boolean;
  playerId: string;
  players: Player[];
  questionList: QuestionHashOnly[];
  roomId: string;
};

export default function useRoundCompletionHandler({
  currentQuestionHash,
  hasJoinedGame,
  showAnswer,
  playerId,
  players,
  questionList,
  roomId,
}: UseRoundCompletionHandlerParams) {
  const isRequestingNewQuestionRef = useRef(false);
  const lastTriggeredNewQuestionKeyRef = useRef<string | null>(null);
  const lastSeenQuestionHashRef = useRef<string | null>(null);
  const wasShowingAnswerRef = useRef(false);

  useEffect(() => {
    if (currentQuestionHash?.hash) {
      lastSeenQuestionHashRef.current = currentQuestionHash.hash;
    }
  }, [currentQuestionHash?.hash]);

  useEffect(() => {
    const currentHash = currentQuestionHash?.hash;
    const completedQuestionHash =
      currentHash ?? lastSeenQuestionHashRef.current;
    const completedIndex = questionList.findIndex(
      (q) => q.hash === completedQuestionHash,
    );
    const hasJustFinishedLastQuestion =
      wasShowingAnswerRef.current &&
      !showAnswer &&
      questionList.length > 0 &&
      completedIndex === questionList.length - 1;
    const isHost = checkIsFirstPlayer(players, playerId);
    const roundKey = `${questionList[0]?.hash ?? "none"}:${completedQuestionHash ?? "none"}`;

    if (
      !hasJoinedGame ||
      !hasJustFinishedLastQuestion ||
      !isHost ||
      isRequestingNewQuestionRef.current ||
      lastTriggeredNewQuestionKeyRef.current === roundKey
    ) {
      wasShowingAnswerRef.current = showAnswer;
      return;
    }

    isRequestingNewQuestionRef.current = true;
    lastTriggeredNewQuestionKeyRef.current = roundKey;

    noticeServerNewQuestion(roomId)
      .catch(() => {
        lastTriggeredNewQuestionKeyRef.current = null;
      })
      .finally(() => {
        isRequestingNewQuestionRef.current = false;
      });

    wasShowingAnswerRef.current = showAnswer;
  }, [
    currentQuestionHash?.hash,
    hasJoinedGame,
    showAnswer,
    playerId,
    players,
    questionList,
    roomId,
  ]);
}
