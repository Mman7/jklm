import { useEffect, useRef } from "react";
import { noticeServerNewQuestion } from "../library/client/client";
import { Player } from "../types/player";
import { QuestionHashOnly } from "../types/question";

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
  // Prevent duplicate in-flight new-question requests.
  const isRequestingNewQuestionRef = useRef(false);
  // Guard key so the same round-completion transition triggers once.
  const lastTriggeredNewQuestionKeyRef = useRef<string | null>(null);
  // Keep last known question hash when state temporarily clears/changes.
  const lastSeenQuestionHashRef = useRef<string | null>(null);
  // Track showAnswer transition edge (true -> false).
  const wasShowingAnswerRef = useRef(false);

  useEffect(() => {
    // Persist latest observed question hash for completion calculations.
    if (currentQuestionHash?.hash) {
      lastSeenQuestionHashRef.current = currentQuestionHash.hash;
    }
  }, [currentQuestionHash?.hash]);

  useEffect(() => {
    // Prefer current hash; fall back to last seen when current is unavailable.
    const currentHash = currentQuestionHash?.hash;
    const completedQuestionHash =
      currentHash ?? lastSeenQuestionHashRef.current;
    // Locate completed question inside current round list.
    const completedIndex = questionList.findIndex(
      (q) => q.hash === completedQuestionHash,
    );
    // "Round finished" means answer screen just closed on the last question.
    const hasJustFinishedLastQuestion =
      wasShowingAnswerRef.current &&
      !showAnswer &&
      questionList.length > 0 &&
      completedIndex === questionList.length - 1;
    const isHost = checkIsFirstPlayer(players, playerId);
    // Round key includes first question + completed question to dedupe retries.
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

    // Host triggers next-round generation exactly once for this round key.
    isRequestingNewQuestionRef.current = true;
    lastTriggeredNewQuestionKeyRef.current = roundKey;

    noticeServerNewQuestion(roomId)
      .catch(() => {
        // Allow retry on failure by clearing dedupe key.
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
